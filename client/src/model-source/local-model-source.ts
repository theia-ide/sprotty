/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject, optional } from "inversify"
import { Bounds } from "../utils/geometry"
import { TYPES } from "../base/types"
import { Action } from "../base/actions/action"
import { ActionHandlerRegistry } from "../base/actions/action-handler"
import { IActionDispatcher } from "../base/actions/action-dispatcher"
import { findElement } from "../base/model/smodel-utils"
import { ViewerOptions } from "../base/views/viewer-options"
import { RequestModelAction, SetModelAction } from "../base/features/set-model"
import { SModelElementSchema, SModelIndex, SModelRootSchema } from "../base/model/smodel"
import { ComputedBoundsAction, RequestBoundsAction } from '../features/bounds/bounds-manipulation'
import { Match, applyMatches } from "../features/update/model-matching"
import { UpdateModelAction, UpdateModelCommand } from "../features/update/update-model"
import { RequestPopupModelAction, SetPopupModelAction } from "../features/hover/hover"
import { ModelSource } from "./model-source"
import { ExportSvgAction } from '../features/export/svg-exporter'
import { saveAs } from 'file-saver'

export type PopupModelFactory = (request: RequestPopupModelAction, element?: SModelElementSchema)
    => SModelRootSchema | undefined

/**
 * A model source that handles actions for bounds calculation and model
 * updates.
 */
@injectable()
export class LocalModelSource extends ModelSource {

    protected currentRoot: SModelRootSchema = {
        type: 'NONE',
        id: 'ROOT'
    }

    get model(): SModelRootSchema {
        return this.currentRoot
    }

    set model(root: SModelRootSchema) {
        this.setModel(root)
    }

    protected onModelSubmitted: (newRoot: SModelRootSchema) => void

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.PopupModelFactory)@optional() protected popupModelFactory?: PopupModelFactory) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions)
    }

    protected initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry)

        // Register model manipulation commands
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        registry.register(ComputedBoundsAction.KIND, this)
        registry.register(RequestPopupModelAction.KIND, this)
    }

    setModel(newRoot: SModelRootSchema): void {
        this.currentRoot = newRoot
        this.submitModel(newRoot, false)
    }

    updateModel(newRoot?: SModelRootSchema): void {
        if (newRoot === undefined) {
            this.submitModel(this.currentRoot, true)
        } else {
            this.currentRoot = newRoot
            this.submitModel(newRoot, true)
        }
    }

    protected submitModel(newRoot: SModelRootSchema, update: boolean): void {
        if (this.viewerOptions.needsClientLayout) {
            this.actionDispatcher.dispatch(new RequestBoundsAction(newRoot))
        } else {
            if (update) {
                this.actionDispatcher.dispatch(new UpdateModelAction(newRoot))
            } else {
                this.actionDispatcher.dispatch(new SetModelAction(newRoot))
            }
            if (this.onModelSubmitted !== undefined) {
                this.onModelSubmitted(newRoot)
            }
        }
    }

    applyMatches(matches: Match[]): void {
        const root = this.currentRoot
        applyMatches(root, matches)
        if (this.viewerOptions.needsClientLayout) {
            this.actionDispatcher.dispatch(new RequestBoundsAction(root))
        } else {
            const update = new UpdateModelAction()
            update.matches = matches
            this.actionDispatcher.dispatch(update)
            if (this.onModelSubmitted !== undefined) {
                this.onModelSubmitted(root)
            }
        }
    }

    addElements(elements: (SModelElementSchema | { element: SModelElementSchema, parentId: string })[]): void {
        const matches: Match[] = []
        for (const i in elements) {
            const e: any = elements[i]
            if (e.element !== undefined && e.parentId !== undefined) {
                matches.push({
                    right: e.element,
                    rightParentId: e.parentId
                })
            } else if (e.id !== undefined) {
                matches.push({
                    right: e,
                    rightParentId: this.currentRoot.id
                })
            }
        }
        this.applyMatches(matches)
    }

    removeElements(elements: (string | { elementId: string, parentId: string })[]) {
        const matches: Match[] = []
        const index = new SModelIndex()
        index.add(this.currentRoot)
        for (const i in elements) {
            const e: any = elements[i]
            if (e.elementId !== undefined && e.parentId !== undefined) {
                const element = index.getById(e.elementId)
                if (element !== undefined) {
                    matches.push({
                        left: element,
                        leftParentId: e.parentId
                    })
                }
            } else {
                const element = index.getById(e)
                if (element !== undefined) {
                    matches.push({
                        left: element,
                        leftParentId: this.currentRoot.id
                    })
                }
            }
        }
        this.applyMatches(matches)
    }

    handle(action: Action): void {
        switch (action.kind) {
            case RequestModelAction.KIND:
                this.handleRequestModel(action as RequestModelAction)
                break
            case ComputedBoundsAction.KIND:
                this.handleComputedBounds(action as ComputedBoundsAction)
                break
            case RequestPopupModelAction.KIND:
                this.handleRequestPopupModel(action as RequestPopupModelAction)
                break
            case ExportSvgAction.KIND:
                this.handleExportSvgAction(action as ExportSvgAction)
                break
        }
    }

    protected handleRequestModel(action: RequestModelAction): void {
        this.submitModel(this.currentRoot, false)
    }

    protected handleComputedBounds(action: ComputedBoundsAction): void {
        const root = this.currentRoot
        const index = new SModelIndex()
        index.add(root)
        for (const b of action.bounds) {
            const element = index.getById(b.elementId)
            if (element !== undefined)
                this.applyBounds(element, b.newBounds)
        }
        this.actionDispatcher.dispatch(new UpdateModelAction(root))
        if (this.onModelSubmitted !== undefined) {
            this.onModelSubmitted(root)
        }
    }

    protected applyBounds(element: SModelElementSchema, newBounds: Bounds) {
        const e = element as any
        e.position = { x: newBounds.x, y: newBounds.y }
        e.size = { width: newBounds.width, height: newBounds.height }
    }

    protected handleRequestPopupModel(action: RequestPopupModelAction): void {
        if (this.popupModelFactory !== undefined) {
            const element = findElement(this.currentRoot, action.elementId)
            const popupRoot = this.popupModelFactory(action, element)
            if (popupRoot !== undefined) {
                popupRoot.canvasBounds = action.bounds
                this.actionDispatcher.dispatch(new SetPopupModelAction(popupRoot))
            }
        }
    }

    protected handleExportSvgAction(action: ExportSvgAction): void {
        const blob = new Blob([action.svg], {type: "text/plain;charset=utf-8"})
        saveAs(blob, "diagram.svg")
    }
}
