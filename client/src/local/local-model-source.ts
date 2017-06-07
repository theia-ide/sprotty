/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify"
import { ComputedBoundsAction, RequestBoundsAction } from '../features/bounds/bounds-manipulation'
import { Bounds } from "../utils/geometry"
import { Match } from "../features/update/model-matching"
import { UpdateModelAction, UpdateModelCommand } from "../features/update/update-model"
import { Action, ActionHandlerRegistry } from "../base/intent/actions"
import { RequestModelAction } from "../base/features/model-manipulation"
import { SModelElementSchema, SModelIndex, SModelRootSchema } from "../base/model/smodel"
import { ModelSource } from "../base/model/model-source"
import { RequestPopupModelAction, SetPopupModelAction } from "../features/hover/hover"

/**
 * A model source that handles actions for bounds calculation and model
 * updates.
 */
@injectable()
export class LocalModelSource extends ModelSource {

    popupModelProvider: (elementId: string) => (SModelRootSchema | undefined)

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

    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry)

        // Register model manipulation commands
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        registry.register(ComputedBoundsAction.KIND, this)
        registry.register(RequestPopupModelAction.KIND, this)
    }

    setModel(root: SModelRootSchema): void {
        this.currentRoot = root
        this.actionDispatcher.dispatch(new RequestBoundsAction(root))
    }

    updateModel(newRoot?: SModelRootSchema): void {
        if (newRoot !== undefined)
            this.currentRoot = newRoot
        this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
    }

    applyMatches(matches: Match[]): void {
        this.applyToModel(matches, this.currentRoot)
        const update = new UpdateModelAction()
        update.matches = matches
        this.actionDispatcher.dispatch(update)
    }

    protected applyToModel(matches: Match[], root: SModelRootSchema): void {
        const index = new SModelIndex()
        index.add(root)
        for (const match of matches) {
            let newElementInserted = false
            if (match.left !== undefined && match.leftParentId !== undefined) {
                const parent = index.getById(match.leftParentId)
                if (parent !== undefined && parent.children !== undefined) {
                    const i = parent.children.indexOf(match.left)
                    if (i >= 0) {
                        if (match.right !== undefined && match.leftParentId === match.rightParentId) {
                            parent.children.splice(i, 1, match.right)
                            newElementInserted = true
                        } else {
                            parent.children.splice(i, 1)
                        }
                    }
                    index.remove(match.left)
                }
            }
            if (!newElementInserted && match.right !== undefined && match.rightParentId !== undefined) {
                const parent = index.getById(match.rightParentId)
                if (parent !== undefined) {
                    if (parent.children === undefined)
                        parent.children = []
                    parent.children.push(match.right)
                }
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
        }
    }

    protected handleRequestPopupModel(action: RequestPopupModelAction): void {
        if (this.popupModelProvider !== undefined) {
            const popupRoot = this.popupModelProvider(action.elementId)
            if (popupRoot !== undefined) {
                popupRoot.canvasBounds = action.bounds
                this.actionDispatcher.dispatch(new SetPopupModelAction(popupRoot))
            }
        }
    }

    protected handleRequestModel(action: RequestModelAction): void {
        this.setModel(this.currentRoot)
    }

    protected handleComputedBounds(action: ComputedBoundsAction): void {
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
