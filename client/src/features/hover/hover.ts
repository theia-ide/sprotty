import { SChildElement, SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action } from "../../base/intent/actions"
import { hasPopupFeature, isHoverable } from "./model"
import { Command, CommandExecutionContext, CommandResult, PopupCommand } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { Bounds } from "../../utils/geometry"
import { KeyListener } from "../../base/view/key-tool"
import { findTargetByFeature } from "../../utils/model"

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

export class SetPopupModelAction implements Action {
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

    protected startTimer(target: SModelElement, event: MouseEvent): Promise<Action> {
        this.stopTimer()
        return new Promise((resolve) => {
            this.hoverTimer = window.setTimeout(() => {

                resolve(new RequestPopupModelAction(target,
                    {
                        x: event.clientX - 20,
                        y: event.clientY + 20,
                        width: -1,
                        height: -1
                    })) //TODO get offset from options

                this.popupOpen = true
            }, 700) //TODO get time from options
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
        const popupTarget = findTargetByFeature(target, hasPopupFeature)

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

        const hoverTarget = findTargetByFeature(target, isHoverable)
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
        const popupTarget = findTargetByFeature(target, hasPopupFeature)
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