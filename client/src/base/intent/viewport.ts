import {Point, Map} from "../../utils"
import {Animation} from "../animations"
import {SModelElement, SModelRoot, Moveable} from "../model"
import {Action} from "./actions"
import {Command, CommandExecutionContext, AbstractCommand} from "./commands"
import {SModelIndex} from "../model/smodel"
import {Viewport, isViewport} from "../model/behavior"

export class ViewportAction implements Action {
    static readonly KIND = 'viewport'
    kind = ViewportAction.KIND

    constructor(public elementId: string, public readonly newViewport: Viewport, public animate: boolean) {
    }
}

export class ViewportCommand extends AbstractCommand {

    element: SModelElement & Viewport
    oldViewport: Viewport
    newViewport: Viewport

    constructor(public action: ViewportAction) {
        super()
        this.newViewport = action.newViewport
    }

    execute(model: SModelRoot, context: CommandExecutionContext) {
        const element = model.index.getById(this.action.elementId)
        if(element && isViewport(element)) {
            this.element = element
            this.oldViewport = {
                centerX: this.element.centerX,
                centerY: this.element.centerY,
                width: this.element.width,
                height: this.element.height,
                zoom: this.element.zoom
            }
            if (this.action.animate)
                return new ViewportAnimation(this.element, this.oldViewport, this.newViewport, context).start()
            else {
                this.element.centerX = this.newViewport.centerX
                this.element.centerY = this.newViewport.centerY
                this.element.zoom = this.newViewport.zoom
            }
        }
        return model
    }

    undo(model: SModelRoot, context: CommandExecutionContext) {
        return new ViewportAnimation(this.element, this.newViewport, this.oldViewport, context).start()
    }

    redo(model: SModelRoot, context: CommandExecutionContext) {
        return new ViewportAnimation(this.element, this.oldViewport, this.newViewport, context).start()
    }

    merge(command: Command, context: CommandExecutionContext) {
        if (!this.action.animate && command instanceof ViewportCommand && this.element == command.element) {
            this.newViewport = command.newViewport
            return true
        }
        return false
    }
}

export class ViewportAnimation extends Animation {

    constructor(private element: SModelElement & Viewport,
                private oldViewport: Viewport,
                private newViewport: Viewport,
                protected context: CommandExecutionContext) {
        super(context)
    }

    tween(t: number) {
        this.element.centerX = (1 - t) * this.oldViewport.centerX + t * this.newViewport.centerX
        this.element.centerY = (1 - t) * this.oldViewport.centerY + t * this.newViewport.centerY
        this.element.zoom = (1 - t) * this.oldViewport.zoom + t * this.newViewport.zoom
        return this.context.root
    }
}
