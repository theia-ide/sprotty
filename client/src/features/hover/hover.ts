import { inject, injectable } from "inversify"
import { SChildElement, SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action, ModelAction } from "../../base/intent/actions"
import { hasPopupFeature, isHoverable } from "./model"
import { Command, CommandExecutionContext, CommandResult, PopupCommand } from "../../base/intent/commands"
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

export interface HoverState {
    hoverTimer: number | undefined
    popupOpen: boolean
    previousPopupElement: SModelElement | undefined
}

@injectable()
export class HoverMouseListener extends MouseListener {

    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions,
                @inject(TYPES.HoverState) protected state: HoverState) {
        super()
    }

    protected calculatePopupPosition(target: SModelElement, mousePosition: Point): Point {
        let offset: Point = { x: -5, y: 20 }
        const maxDist = 150

        const targetBounds = getAbsoluteBounds(target)
        const canvasBounds = target.root.canvasBounds
        const boundsInWindow = translate(targetBounds, canvasBounds)
        console.log('mousePosition:', mousePosition)
        console.log('targetBounds:', targetBounds)
        console.log('boundsInWindow:', boundsInWindow)
        const distRight = boundsInWindow.x + boundsInWindow.width - mousePosition.x
        const distBottom = boundsInWindow.y + boundsInWindow.height - mousePosition.y
        if (distBottom <= distRight && distBottom < maxDist) {
            offset = { x: -5, y: Math.round(distBottom + 5) }
        } else if (distRight <= distBottom && distRight < maxDist) {
            offset = { x: Math.round(distRight + 5), y: -5 }
        }

        return { x: mousePosition.x + offset.x, y: mousePosition.y + offset.y }
    }

    protected startTimer(target: SModelElement, event: MouseEvent): Promise<Action> {
        this.stopTimer()
        return new Promise((resolve) => {
            this.state.hoverTimer = window.setTimeout(() => {
                const popupPosition = this.calculatePopupPosition(target, {x: event.pageX, y: event.pageY})
                resolve(new RequestPopupModelAction(target,
                    {
                        x: popupPosition.x,
                        y: popupPosition.y,
                        width: -1,
                        height: -1
                    }))

                this.state.popupOpen = true
            }, this.options.popupDelay)
        })
    }

    protected stopTimer(): void {
        if (this.state.hoverTimer !== undefined) {
            window.clearTimeout(this.state.hoverTimer)
            this.state.hoverTimer = undefined
        }
    }

    mouseOver(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const state = this.state
        const result: (Action | Promise<Action>)[] = []
        const popupTarget = findParent(target, hasPopupFeature)

        if (state.popupOpen && (popupTarget === undefined ||
            state.previousPopupElement !== undefined && state.previousPopupElement.id !== popupTarget.id)) {
            state.popupOpen = false
            result.push(new SetPopupModelAction({type: EMPTY_ROOT.type, id: EMPTY_ROOT.id}))
        }
        if (popupTarget !== undefined &&
            (state.previousPopupElement === undefined || state.previousPopupElement.id !== popupTarget.id)) {
            result.push(this.startTimer(popupTarget, event))
        }

        state.previousPopupElement = popupTarget

        const hoverTarget = findParentByFeature(target, isHoverable)
        if (hoverTarget !== undefined)
            result.push(new HoverFeedbackAction(hoverTarget.id, true))

        return result
    }

    mouseOut(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const result: (Action | Promise<Action>)[] = []

        if (!this.state.popupOpen)
            this.stopTimer()

        if (isHoverable(target))
            result.push(new HoverFeedbackAction(target.id, false))

        return result
    }

    mouseMove(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const popupTarget = findParent(target, hasPopupFeature)
        return this.state.popupOpen || popupTarget === undefined ? [] : [this.startTimer(popupTarget, event)]
    }
}


@injectable()
export class PopupHoverMouseListener extends MouseListener {

    constructor(@inject(TYPES.HoverState) protected state: HoverState) {
        super()
    }

    mouseOut(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        console.log("Whoo-hooo!")
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