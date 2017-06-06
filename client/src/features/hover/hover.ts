/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify"
import { SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action } from "../../base/intent/actions"
import { hasPopupFeature, isHoverable } from "./model"
import { Command, CommandExecutionContext, PopupCommand } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { Bounds, Point, translate } from "../../utils/geometry"
import { KeyListener } from "../../base/view/key-tool"
import { findParentByFeature, findParent, getAbsoluteBounds } from "../../base/model/smodel-utils"
import { ViewerOptions } from "../../base/view/options"
import { TYPES } from "../../base/types"

export class HoverFeedbackAction implements Action {
    kind = HoverFeedbackCommand.KIND

    constructor(public readonly mouseoverElement: string, public readonly mouseIsOver: boolean) {
    }
}

export class HoverFeedbackCommand extends Command {
    static readonly KIND = 'hoverFeedback'

    constructor(public action: HoverFeedbackAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {

        const model: SModelRoot = context.root
        const modelElement: SModelElement | undefined = model.index.getById(this.action.mouseoverElement)

        if (modelElement) {
            if (isHoverable(modelElement)) {
                modelElement.hoverFeedback = this.action.mouseIsOver
            }
        }

        return this.redo(context)
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return context.root
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return context.root
    }
}

export class RequestPopupModelAction implements Action {
    static readonly KIND = 'requestPopupModel'
    readonly kind = RequestPopupModelAction.KIND

    constructor(public elementId: string, public bounds: Bounds) {
    }
}

export class SetPopupModelAction implements Action {
    readonly kind = SetPopupModelCommand.KIND

    constructor(public newRoot: SModelRootSchema) {
    }
}

export class SetPopupModelCommand extends PopupCommand {
    static readonly KIND = 'setPopupModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetPopupModelAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        this.oldRoot = context.root
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)

        return this.newRoot
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return this.oldRoot
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return this.newRoot
    }
}

export interface HoverState {
    mouseOverTimer: number | undefined
    mouseOutTimer: number | undefined
    popupOpen: boolean
    previousPopupElement: SModelElement | undefined
}

export abstract class AbstractHoverMouseListener extends MouseListener {
    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions,
                @inject(TYPES.HoverState) protected state: HoverState) {
        super()
    }

    protected stopMouseOutTimer(): void {
        if (this.state.mouseOutTimer !== undefined) {
            window.clearTimeout(this.state.mouseOutTimer)
            this.state.mouseOutTimer = undefined
        }
    }

    protected startMouseOutTimer(): Promise<Action> {
        this.stopMouseOutTimer()
        return new Promise((resolve) => {
            this.state.mouseOutTimer = window.setTimeout(() => {
                this.state.popupOpen = false
                this.state.previousPopupElement = undefined
                resolve(new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id}))
            }, this.options.popupCloseDelay)
        })
    }

    protected stopMouseOverTimer(): void {
        if (this.state.mouseOverTimer !== undefined) {
            window.clearTimeout(this.state.mouseOverTimer)
            this.state.mouseOverTimer = undefined
        }
    }
}

@injectable()
export class HoverMouseListener extends AbstractHoverMouseListener {

    protected calculatePopupPosition(target: SModelElement, mousePosition: Point): Point {
        let offset: Point = {x: -5, y: 20}
        const maxDist = 150

        const targetBounds = getAbsoluteBounds(target)
        const canvasBounds = target.root.canvasBounds
        const boundsInWindow = translate(targetBounds, canvasBounds)
        const distRight = boundsInWindow.x + boundsInWindow.width - mousePosition.x
        const distBottom = boundsInWindow.y + boundsInWindow.height - mousePosition.y
        if (distBottom <= distRight && distBottom < maxDist) {
            offset = {x: -5, y: Math.round(distBottom + 5)}
        } else if (distRight <= distBottom && distRight < maxDist) {
            offset = {x: Math.round(distRight + 5), y: -5}
        }
        let leftPopupPosition = mousePosition.x + offset.x
        const canvasRightBorderPosition = canvasBounds.x + canvasBounds.width
        if (leftPopupPosition > canvasRightBorderPosition) {
            leftPopupPosition = canvasRightBorderPosition
        }
        let topPopupPosition = mousePosition.y + offset.y
        const canvasBottomBorderPosition = canvasBounds.y + canvasBounds.height
        if (topPopupPosition > canvasBottomBorderPosition) {
            topPopupPosition = canvasBottomBorderPosition
        }
        return {x: leftPopupPosition, y: topPopupPosition}
    }

    protected startMouseOverTimer(target: SModelElement, event: MouseEvent): Promise<Action> {
        this.stopMouseOverTimer()
        return new Promise((resolve) => {
            this.state.mouseOverTimer = window.setTimeout(() => {
                const popupPosition = this.calculatePopupPosition(target, {x: event.pageX, y: event.pageY})
                resolve(new RequestPopupModelAction(target.id,
                    {
                        x: popupPosition.x,
                        y: popupPosition.y,
                        width: -1,
                        height: -1
                    }))

                this.state.popupOpen = true
                this.state.previousPopupElement = target
            }, this.options.popupOpenDelay)
        })
    }

    mouseOver(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const state = this.state
        const result: (Action | Promise<Action>)[] = []
        const popupTarget = findParent(target, hasPopupFeature)

        if (state.popupOpen && (popupTarget === undefined ||
            state.previousPopupElement !== undefined && state.previousPopupElement.id !== popupTarget.id)) {
            result.push(this.startMouseOutTimer())
        } else {
            this.stopMouseOverTimer()
            this.stopMouseOutTimer()
        }
        if (popupTarget !== undefined &&
            (state.previousPopupElement === undefined || state.previousPopupElement.id !== popupTarget.id)) {
            result.push(this.startMouseOverTimer(popupTarget, event))
        }

        const hoverTarget = findParentByFeature(target, isHoverable)
        if (hoverTarget !== undefined)
            result.push(new HoverFeedbackAction(hoverTarget.id, true))

        return result
    }

    mouseOut(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const result: (Action | Promise<Action>)[] = []

        if (!this.state.popupOpen)
            this.stopMouseOverTimer()

        if (isHoverable(target))
            result.push(new HoverFeedbackAction(target.id, false))

        return result
    }

    mouseMove(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const popupTarget = findParent(target, hasPopupFeature)
        return this.state.popupOpen || popupTarget === undefined ? [] : [this.startMouseOverTimer(popupTarget, event)]
    }
}

@injectable()
export class PopupHoverMouseListener extends AbstractHoverMouseListener {

    mouseOut(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        return [this.startMouseOutTimer()]
    }

    mouseOver(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        this.stopMouseOutTimer()
        this.stopMouseOverTimer()
        return []
    }
}

export class HoverKeyListener extends KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        if (event.keyCode == 27) {
            return [new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id})]
        }
        return []
    }
}