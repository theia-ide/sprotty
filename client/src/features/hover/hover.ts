import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action } from "../../base/intent/actions"
import { isHoverable } from "./model"
import { Command, CommandExecutionContext, CommandResult } from "../../base/intent/commands"


export class HoverAction implements Action {
    kind = HoverCommand.KIND

    constructor(public readonly mouseoverElement: string, public readonly mouseIsOver: boolean) {
    }
}

export class HoverPopupAction implements Action {
    kind: string

}

export class HoverCommand extends Command {
    static readonly KIND = 'elementHovered'

    constructor(public action: HoverAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {

        const model: SModelRoot = context.root
        const modelElement: SModelElement | undefined = model.index.getById(this.action.mouseoverElement)

        if(modelElement){
            if(isHoverable(modelElement)){
                modelElement.mouseover = this.action.mouseIsOver
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


export class HoverListener extends MouseListener {
    private hoverTime: number
    private theTarget: SModelElement

    private startTimer(): void {
        window.clearTimeout(this.hoverTime)

        this.hoverTime = window.setTimeout(() => {
            // TODO do something here.
            // Call the action dispatcher or resolve a promise which is given to
            // hover action constructor.
            window.clearTimeout(this.hoverTime)
        }, 700) //TODO get time from options...or something like that
    }

    private stopTimer(): void {
        window.clearTimeout(this.hoverTime)
    }

    mouseOver(target: SModelElement, event: MouseEvent): Action[] {
        if (isHoverable(target)) {
            if (!target.mouseover) {
                this.theTarget = target
                this.startTimer()
            }
        }
        return [new HoverAction(target.id, true)]
    }

    mouseOut(target: SModelElement, event: MouseEvent): Action[] {
        if (isHoverable(target) && target.mouseover) {
            this.stopTimer()
        }
        return [new HoverAction(target.id, false)]
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        if (isHoverable(target)) {
            this.startTimer()
        }

        return []
    }
}