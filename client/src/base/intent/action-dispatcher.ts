/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { EMPTY_ROOT } from '../model/smodel-factory';
import { SetModelAction, SetModelCommand } from '../features/model-manipulation';
import { inject, injectable } from "inversify"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { RedoAction, UndoAction } from "../../features/undo-redo/undo-redo"
import { Action, ActionHandlerRegistry, isAction } from "./actions"
import { ICommandStack } from "./command-stack"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"

export interface IActionDispatcher {
    dispatch(action: Action, onExecute?: (action: Action)=>void): void
    dispatchAll(actions: Action[]): void
}

/**
 * Collects actions, converts them to commands and dispatches them.
 * Also acts as the proxy to the sprotty server.
 */
@injectable()
export class ActionDispatcher implements IActionDispatcher {

    protected blockUntilActionKind: string | undefined
    protected postponedActions: ActionAndHook[]

    constructor(@inject(TYPES.ActionHandlerRegistry) protected actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ICommandStack) protected commandStack: ICommandStack,
                @inject(TYPES.ILogger) protected logger: ILogger,
                @inject(TYPES.AnimationFrameSyncer) protected syncer: AnimationFrameSyncer) {
        this.postponedActions = []
        const initialCommand = new SetModelCommand(new SetModelAction(EMPTY_ROOT, true))
        this.blockUntilActionKind = initialCommand.blockUntilActionKind
        this.commandStack.execute(initialCommand)
    }

    dispatchAll(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action, onExecute?: (action: Action)=>void): void {
        if (action.kind === this.blockUntilActionKind) {
            this.blockUntilActionKind = undefined
            this.handleAction(action)
            const actions = this.postponedActions
            this.postponedActions = []
            actions.forEach(
                a => this.dispatch(a.action, a.onExecute)
            )
            return
        } 
        if (this.blockUntilActionKind !== undefined) {
            this.logger.log(this, 'waiting for ' + this.blockUntilActionKind + '. postponing', action)
            this.postponedActions.push({
                action: action,
                onExecute: onExecute
            })
            return
        }
        if (onExecute !== undefined)
            onExecute.call(null, action) 
        if (action.kind === UndoAction.KIND) {
            this.commandStack.undo()
        } else if (action.kind === RedoAction.KIND) {
            this.commandStack.redo()
        } else {
            this.handleAction(action)
        }
    }

    protected handleAction(action: Action): void {
        this.logger.log(this, 'handle', action)
        const handlers = this.actionHandlerRegistry.get(action.kind)
        if (handlers.length > 0) {
            for (let handler of handlers) {
                const result = handler.handle(action)
                if (isAction(result))
                    this.dispatch(result)
                else if (result !== undefined) {
                    this.commandStack.execute(result)
                    this.blockUntilActionKind = result.blockUntilActionKind
                }
            }
        } else {
            this.logger.warn(this, 'missing handler for action', action)
        }
    }
}

export interface ActionAndHook {
    action: Action
    onExecute?: (action: Action)=>void
}