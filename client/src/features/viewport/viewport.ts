import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Action } from "../../base/intent/actions"
import { AbstractCommand, Command, CommandExecutionContext } from "../../base/intent/commands"
import { Animation } from "../../base/animations/animation"
import { isViewport, Viewport } from "./model"

export class ViewportAction implements Action {
    kind = ViewportCommand.KIND

    constructor(public readonly elementId: string,
                public readonly newViewport: Viewport,
                public readonly animate: boolean) {
    }
}

export class ViewportCommand extends AbstractCommand {
    static readonly KIND = 'viewport'

    protected element: SModelElement & Viewport
    protected oldViewport: Viewport
    protected newViewport: Viewport

    constructor(protected action: ViewportAction) {
        super()
        this.newViewport = action.newViewport
    }

    execute(model: SModelRoot, context: CommandExecutionContext) {
        const element = model.index.getById(this.action.elementId)
        if (element && isViewport(element)) {
            this.element = element
            this.oldViewport = {
                scroll: this.element.scroll,
                zoom: this.element.zoom,
            }
            if (this.action.animate)
                return new ViewportAnimation(this.element, this.oldViewport, this.newViewport, context).start()
            else {
                this.element.scroll = this.newViewport.scroll
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

    protected zoomFactor: number

    constructor(protected element: SModelElement & Viewport,
                protected oldViewport: Viewport,
                protected newViewport: Viewport,
                protected context: CommandExecutionContext) {
        super(context)
        this.zoomFactor = Math.log(newViewport.zoom / oldViewport.zoom)
    }

    tween(t: number) {
        this.element.scroll = {
            x: (1 - t) * this.oldViewport.scroll.x + t * this.newViewport.scroll.x,
            y: (1 - t) * this.oldViewport.scroll.y + t * this.newViewport.scroll.y
        }
        this.element.zoom = this.oldViewport.zoom * Math.exp(t * this.zoomFactor)
        return this.context.root
    }
}
