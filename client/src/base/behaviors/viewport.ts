import {Action} from "../intent/actions"
import {Command, CommandExecutionContext, AbstractCommand} from "../intent/commands"
import {BehaviorSchema} from "../model/behavior"
import {Scrollable} from "./scroll"
import {Zoomable} from "./zoom"
import {SModelElement, SModelRoot} from "../model/smodel"
import {Animation} from "../animations/animation"

export interface Viewport extends BehaviorSchema, Scrollable, Zoomable {
}

export function isViewport(element: SModelElement | Viewport): element is Viewport & Scrollable & Zoomable {
    return 'zoom' in element
        && 'scroll' in element
}

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
                scroll: {
                    x: this.element.scroll.x,
                    y: this.element.scroll.y
                },
                zoom: this.element.zoom,
            }
            if (this.action.animate)
                return new ViewportAnimation(this.element, this.oldViewport, this.newViewport, context).start()
            else {
                this.element.scroll.x = this.newViewport.scroll.x
                this.element.scroll.y = this.newViewport.scroll.y
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
        this.element.scroll.x = (1 - t) * this.oldViewport.scroll.x + t * this.newViewport.scroll.x
        this.element.scroll.y = (1 - t) * this.oldViewport.scroll.y + t * this.newViewport.scroll.y
        this.element.zoom = (1 - t) * this.oldViewport.zoom + t * this.newViewport.zoom
        return this.context.root
    }
}
