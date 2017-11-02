/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify"
import {
    TYPES, SModelElementSchema, SModelRootSchema, RequestPopupModelAction, MouseListener,
    SModelElement, Action, LocalModelSource, SNodeSchema, SetPopupModelAction, EMPTY_ROOT,
    Dimension, Point, CommandStack, SModelRoot
} from "../../../src"
import { PopupButtonSchema, PopupButton } from "./model"
import { PopupButtonView } from "./views"

export function popupModelFactory(request: RequestPopupModelAction, element?: SModelElementSchema): SModelRootSchema | undefined {
    if (element === undefined || element.type === 'mindmap') {
        return <PopupButtonSchema> {
            type: 'popup:button',
            id: 'button',
            kind: 'add-node'
        }
    } else if (element !== undefined && element.type === 'node') {
        return <PopupButtonSchema> {
            type: 'popup:button',
            id: 'button',
            kind: 'remove-node',
            target: element.id
        }
    }
    return undefined
}

@injectable()
export class PopupButtonMouseListener extends MouseListener {

    constructor(@inject(TYPES.ModelSource) protected modelSource: LocalModelSource,
                @inject(TYPES.ICommandStack) protected commandStack: CommandStack) {
        super()
    }

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (target instanceof PopupButton) {
            switch (target.kind) {
                case 'add-node':
                    this.commandStack.currentModel.then(state => this.addNode(target, state.root))
                    break;
                case 'remove-node':
                    this.removeNode(target)
                    break;
            }
        }
        return [ new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id}) ]
    }
    
    protected addNode(button: PopupButton, root: SModelRoot) {
        const elementSize: Dimension = { width: 100, height: 60 }
        const buttonPos = root.parentToLocal({
            x: button.canvasBounds.x + PopupButtonView.SIZE / 2 - root.canvasBounds.x,
            y: button.canvasBounds.y + PopupButtonView.SIZE / 2 - root.canvasBounds.y
        })
        const elementPos: Point = {
            x: buttonPos.x - elementSize.width / 2,
            y: buttonPos.y - elementSize.height / 2
        }
        const newElement: SNodeSchema = {
            type: 'node',
            id: 'node_' + Math.trunc(Math.random() * 0x80000000).toString(16),
            size: elementSize,
            position: elementPos,
            hoverFeedback: true
        };
        this.modelSource.addElements([ newElement ])
    }

    protected removeNode(button: PopupButton) {
        this.modelSource.removeElements([ button.target ])
    }

}
