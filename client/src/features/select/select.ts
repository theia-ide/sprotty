/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { VNode } from "snabbdom/vnode"
import { isCtrlOrCmd } from "../../utils/browser"
import { SChildElement, SModelElement, SModelRoot, SParentElement } from "../../base/model/smodel"
import { findParentByFeature } from "../../base/model/smodel-utils"
import { Action } from "../../base/actions/action"
import { Command, CommandExecutionContext } from "../../base/commands/command"
import { SEdge, SNode } from "../../graph/sgraph"
import { MouseListener } from "../../base/views/mouse-tool"
import { KeyListener } from "../../base/views/key-tool"
import { setClass } from "../../base/views/vnode-utils"
import { isSelectable } from "./model"
import { ButtonHandlerRegistry } from './button-handler'
import { inject } from 'inversify'
import { SButton } from '../../graph/sgraph'

/**
 * Triggered when the user changes the selection, e.g. by clicking on a selectable element. The resulting
 * SelectCommand changes the `selected` state accordingly, so the elements can be rendered differently.
 * This action is also forwarded to the diagram server, if present, so it may react on the selection change.
 * Furthermore, the server can send such an action to the client in order to change the selection programmatically.
 */
export class SelectAction implements Action {
    kind = SelectCommand.KIND
    selectAll: boolean = false
    deselectAll: boolean = false

    constructor(public readonly selectedElementsIDs: string[] = [], public readonly deselectedElementsIDs: string[] = []) {
    }
}

export type ElementSelection = {
    element: SChildElement
    index: number
}

export class SelectCommand extends Command {
    static readonly KIND = 'elementSelected'

    protected selected: ElementSelection[] = []
    protected deselected: ElementSelection[] = []

    constructor(public action: SelectAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        const selectedNodeIds: string[] = []
        const model = context.root
        if (this.action.selectAll) {
            const elementStack: SModelElement[] = [model]
            do {
                const element = elementStack.pop()!
                if (element instanceof SParentElement) {
                    for (const child of element.children) {
                        elementStack.push(child)
                    }
                }
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.selected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                    if (element instanceof SNode)
                        selectedNodeIds.push(element.id)
                }
            } while (elementStack.length > 0)
        } else {
            this.action.selectedElementsIDs.forEach(id => {
                const element = model.index.getById(id)
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.selected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                    if (element instanceof SNode)
                        selectedNodeIds.push(id)
                }
            })
        }
        if (selectedNodeIds.length > 0) {
            const connectedEdges: ElementSelection[] = []
            model.index.all().forEach(
                element => {
                    if (element instanceof SEdge
                        && (selectedNodeIds.indexOf(element.sourceId) >= 0
                        || selectedNodeIds.indexOf(element.targetId) >= 0)) {
                        connectedEdges.push({
                            element: element,
                            index: element.parent.children.indexOf(element)
                        })
                    }
                })
            this.selected = connectedEdges.concat(this.selected)
        }
        if (this.action.deselectAll) {
            const elementStack: SModelElement[] = [model]
            do {
                const element = elementStack.pop()!
                if (element instanceof SParentElement) {
                    for (const child of element.children) {
                        elementStack.push(child)
                    }
                }
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.deselected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            } while (elementStack.length > 0)
        } else {
            this.action.deselectedElementsIDs.forEach(id => {
                const element = model.index.getById(id)
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.deselected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            })
        }
        return this.redo(context)
    }

    undo(context: CommandExecutionContext): SModelRoot {
        for (let i = this.selected.length - 1; i >= 0; --i) {
            const selection = this.selected[i]
            const element = selection.element
            if (isSelectable(element))
                element.selected = false
            element.parent.move(element, selection.index)
        }
        this.deselected.reverse().forEach(selection => {
            if (isSelectable(selection.element))
                selection.element.selected = true
        })
        return context.root
    }

    redo(context: CommandExecutionContext): SModelRoot {
        for (let i = 0; i < this.selected.length; ++i) {
            const selection = this.selected[i]
            const element = selection.element
            const childrenLength = element.parent.children.length
            element.parent.move(element, childrenLength - 1)
        }
        this.deselected.forEach(selection => {
            if (isSelectable(selection.element))
                selection.element.selected = false
        })
        this.selected.forEach(selection => {
            if (isSelectable(selection.element))
                selection.element.selected = true
        })
        return context.root
    }
}

export class SelectMouseListener extends MouseListener {

    constructor(@inject(ButtonHandlerRegistry) protected buttonHandlerRegistry: ButtonHandlerRegistry) {
        super()
    }

    wasSelected = false
    hasDragged = false

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button === 0) {
            if (target instanceof SButton) {
                const buttonHandler = this.buttonHandlerRegistry.get(target.type)
                if (buttonHandler !== undefined)
                    return buttonHandler.buttonPressed(target)
            }
            const selectableTarget = findParentByFeature(target, isSelectable)
            if (selectableTarget !== undefined || target instanceof SModelRoot) {
                this.hasDragged = false
                let deselectIds: string[] = []
                // multi-selection?
                if (!isCtrlOrCmd(event)) {
                    deselectIds = target.root
                        .index
                        .all()
                        .filter(element => isSelectable(element) && element.selected)
                        .map(element => element.id)
                }
                if (selectableTarget !== undefined) {
                    if (!selectableTarget.selected) {
                        this.wasSelected = false
                        return [new SelectAction([selectableTarget.id], deselectIds)]
                    } else {
                        if (isCtrlOrCmd(event)) {
                            this.wasSelected = false
                            return [new SelectAction([], [selectableTarget.id])]
                        } else {
                            this.wasSelected = true
                        }
                    }
                } else {
                    return [new SelectAction([], deselectIds)]
                }
            }
        }
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        this.hasDragged = true
        return []
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button === 0) {
            if (!this.hasDragged) {
                const selectableTarget = findParentByFeature(target, isSelectable)
                if (selectableTarget !== undefined && this.wasSelected) {
                    return [new SelectAction([selectableTarget.id], [])]
                }
            }
        }
        this.hasDragged = false
        return []
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        const selectableTarget = findParentByFeature(element, isSelectable)
        if (selectableTarget !== undefined)
            setClass(vnode, 'selected', selectableTarget.selected)
        return vnode
    }
}

export class SelectKeyboardListener extends KeyListener {
    keyDown(element: SModelElement, event: KeyboardEvent): Action[] {
        if (isCtrlOrCmd(event) && event.keyCode === 65) {
            return [new SelectAction(
                element.root.index.all().filter(e => isSelectable(e)).map(e => e.id), [])]
        }
        return []
    }
}
