import { SChildElement, SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action, ModelAction } from "../../base/intent/actions"
import { hasPopupFeature, isHoverable } from "./model"
import { Command, CommandExecutionContext, CommandResult, PopupCommand } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { Bounds, Point } from "../../utils/geometry"
import { KeyListener } from "../../base/view/key-tool"
import { findParentByFeature, findParent } from "../../utils/model"
import { ViewerOptions } from "../../base/view/options"
import { TYPES } from "../../base/types"
import { inject } from "inversify"
import { isViewport, Viewport } from "../viewport/model"
import { isLocateable, isMoveable } from "../move/model"
import { isLayouting } from "../bounds/model"

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

export class RequestPopupModelAction implements ModelAction {
    static readonly KIND = 'requestPopupModel'
    readonly kind = RequestPopupModelAction.KIND

    modelType: string
    modelId: string
    elementId: string

    constructor(element: SModelElement, public bounds: Bounds) {
        const root = element.root
        this.modelType = root.type
        this.modelId = root.id
        this.elementId = element.id
    }
}

export class SetPopupModelAction implements ModelAction {
    readonly kind = SetPopupModelCommand.KIND

    modelType: string
    modelId: string

    constructor(public newRoot: SModelRootSchema) {
        this.modelType = newRoot.type
        this.modelId = newRoot.id
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

export class HoverListener extends MouseListener {
    protected hoverTimer: number | undefined
    protected popupOpen: boolean = false
    protected previousPopupElement: SModelElement | undefined

    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions) {
        super()
    }

    protected calculatePopupPosition(target: SModelElement, mousePosition: Point): Point {
        const viewport = findParentByFeature(target, isViewport)
        const layoutTarget = findParentByFeature(target, isLayouting)
        let offset: Point = {x: 20, y: 20}
        const maxDist = 150

        if (viewport !== undefined && layoutTarget !== undefined) {
            const canvasBounds = target.root.canvasBounds
            const vscroll = viewport.scroll
            const zoom = viewport.zoom
            const tbounds = layoutTarget.bounds

            const targetBounds: Bounds =
                {
                    x: Math.round(canvasBounds.x - ((vscroll.x - tbounds.x) * zoom)),
                    y: Math.round(canvasBounds.y - ((vscroll.y - tbounds.y) * zoom)),
                    width: Math.round(tbounds.width * zoom),
                    height: Math.round(tbounds.height * zoom)
                }
            const distRight = targetBounds.width + targetBounds.x - mousePosition.x
            const distBottom = targetBounds.height + targetBounds.y - mousePosition.y
            if (distBottom < distRight && distBottom < maxDist) {
                offset = {x: 0, y: distBottom + 5}
            } else if (distRight < distBottom && distRight < maxDist) {
                offset = {x: distRight + 5, y: 0}
            }
        }

        return {x: mousePosition.x + offset.x, y: mousePosition.y + offset.y}
    }

    protected startTimer(target: SModelElement, event: MouseEvent): Promise<Action> {
        this.stopTimer()
        return new Promise((resolve) => {
            this.hoverTimer = window.setTimeout(() => {
                const popupPosition = this.calculatePopupPosition(target, {x: event.clientX, y: event.clientY})
                resolve(new RequestPopupModelAction(target,
                    {
                        x: popupPosition.x,
                        y: popupPosition.y,
                        width: -1,
                        height: -1
                    }))

                this.popupOpen = true
            }, this.options.popupDelay)
        })
    }

    protected stopTimer(): void {
        if (this.hoverTimer !== undefined) {
            window.clearTimeout(this.hoverTimer)
            this.hoverTimer = undefined
        }
    }

    mouseOver(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const result: (Action | Promise<Action>)[] = []
        const popupTarget = findParent(target, hasPopupFeature)

        if (this.popupOpen && (popupTarget === undefined ||
            this.previousPopupElement !== undefined && this.previousPopupElement.id !== popupTarget.id)) {
            this.popupOpen = false
            result.push(new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id}))
        }
        if (popupTarget !== undefined &&
            (this.previousPopupElement === undefined || this.previousPopupElement.id !== popupTarget.id)) {
            result.push(this.startTimer(popupTarget, event))
        }

        this.previousPopupElement = popupTarget

        const hoverTarget = findParentByFeature(target, isHoverable)
        if (hoverTarget !== undefined)
            result.push(new HoverFeedbackAction(hoverTarget.id, true))

        return result
    }

    mouseOut(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const result: (Action | Promise<Action>)[] = []

        if (!this.popupOpen)
            this.stopTimer()

        if (isHoverable(target))
            result.push(new HoverFeedbackAction(target.id, false))

        return result
    }

    mouseMove(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const popupTarget = findParent(target, hasPopupFeature)
        return this.popupOpen || popupTarget === undefined ? [] : [this.startTimer(popupTarget, event)]
    }
}

export class PopupKeyboardListener extends KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        if (event.keyCode == 27) {
            return [new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id})]
        }
        return []
    }
}