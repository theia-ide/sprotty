/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify"
import { SetModelCommand } from "../base/features/model-manipulation"
import { Action, ActionHandlerRegistry } from "../base/intent/actions"
import { ICommand } from "../base/intent/commands"
import { IActionDispatcher } from "../base/intent/action-dispatcher"
import { TYPES } from "../base/types"
import { ViewerOptions } from "../base/view/options"
import { ILogger } from "../utils/logging"
import { SModelStorage } from "../base/model/smodel-storage"
import { SModelRootSchema, SModelIndex, SModelElementSchema } from "../base/model/smodel"
import { ModelSource } from "../base/model/model-source"
import { UpdateModelCommand, UpdateModelAction } from "../features/update/update-model"
import { ComputedBoundsAction, RequestBoundsCommand } from '../features/bounds/bounds-manipulation'
import { Bounds } from "../utils/geometry"
import { RequestPopupModelAction } from "../features/hover/hover"

/**
 * Wrapper for messages when transferring them vie a DiagramServer.
 */
export interface ActionMessage {
    clientId: string
    action: Action
}

export function isActionMessage(object: any): object is ActionMessage {
    return object !== undefined && object.hasOwnProperty('clientId') && object.hasOwnProperty('action')
}

/**
 * A ModelSource that communicates with an external model provider, e.g.
 * a model editor.
 * 
 * This class defines which actions are sent to and received from the
 * external model source.
 */
@injectable()
export abstract class DiagramServer extends ModelSource {

    clientId: string

    currentRoot: SModelRootSchema = {
        type: 'NONE',
        id: 'ROOT'
    }

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.SModelStorage) protected storage: SModelStorage,
                @inject(TYPES.ILogger) protected logger: ILogger) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions)
        this.clientId = this.viewerOptions.baseDiv
    }

    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry)

        // Register model manipulation commands
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        registry.register(ComputedBoundsAction.KIND, this)
        registry.register(RequestBoundsCommand.KIND, this)
        registry.register(RequestPopupModelAction.KIND, this)
    }

    handle(action: Action): void | ICommand {
        this.storeNewModel(action)

        if (action.kind === ComputedBoundsAction.KIND && !this.viewerOptions.needsServerLayout) 
            return this.handleComputedBounds(action as ComputedBoundsAction)
        
        if (action.kind === RequestBoundsCommand.KIND)
            return

        const message: ActionMessage = {
            clientId: this.clientId,
            action: action
        }
        this.logger.log(this, 'sending', message)
        this.sendMessage(JSON.stringify(message))
    }

    protected abstract sendMessage(message: string): void

    protected messageReceived(data: any): void {
        const object = typeof(data) === 'string' ? JSON.parse(data) : data
        if (isActionMessage(object) && object.action) {
            if (!object.clientId || object.clientId === this.clientId) {
                this.logger.log(this, 'receiving', object)
                this.actionDispatcher.dispatch(object.action, this.storeNewModel.bind(this))
            }
        } else {
            this.logger.error(this, 'received data is not an action message', object)
        }
    }

    protected storeNewModel(action: Action): void {
        if (action.kind === SetModelCommand.KIND 
            || action.kind === UpdateModelCommand.KIND
            || action.kind === RequestBoundsCommand.KIND) {
            const newRoot = (action as any).newRoot
            if (newRoot) {
                this.currentRoot = newRoot as SModelRootSchema
                this.storage.store(this.currentRoot)
            }
        }
    }

    protected handleComputedBounds(action: ComputedBoundsAction): ICommand | void {
        const index = new SModelIndex()
        index.add(this.currentRoot)
        for (const b of action.bounds) {
            const element = index.getById(b.elementId)
            if (element !== undefined)
                this.applyBounds(element, b.newBounds)
        }
        this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
    }

    protected applyBounds(element: SModelElementSchema, newBounds: Bounds) {
        const e = element as any
        e.position = { x: newBounds.x, y: newBounds.y }
        e.size = { width: newBounds.width, height: newBounds.height }
    }
}
