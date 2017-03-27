import {Action} from "../../base/intent/actions"
import {Command, CommandExecutionContext, AbstractCommand} from "../../base/intent/commands"
import {BehaviorSchema} from "../../base/model/behavior"
import {Scrollable} from "./scroll"
import {Zoomable} from "./zoom"
import {SModelElement, SModelRoot} from "../../base/model/smodel"
import {Animation} from "../../base/animations/animation"

export interface Viewport extends BehaviorSchema, Scrollable, Zoomable {
}

export function isViewport(element: SModelElement | Viewport): element is Viewport & Scrollable & Zoomable {
    return 'zoom' in element
        && 'scroll' in element
}

export class ViewportAction implements Action {
    kind = ViewportCommand.KIND

    constructor(public elementId: string, public readonly newViewport: Viewport, public animate: boolean) {
    }
}

export class ViewportCommand extends AbstractCommand {
    static readonly KIND = 'viewport'

    element: SModelElement & Viewport
    oldViewport: Viewport
    newViewport: Viewport

    constructor(public action: ViewportAction) {
        super()
        this.newViewport = action.newViewport
    }

    execute(model: SModelRoot, context: CommandExecutionContext) {
        const element = model.index.getById(this.action.elementId)
        if (element && isViewport(element)) {
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

    private zoomFactor: number

    constructor(private element: SModelElement & Viewport,
                private oldViewport: Viewport,
                private newViewport: Viewport,
                protected context: CommandExecutionContext) {
        super(context)
        this.zoomFactor = Math.log(newViewport.zoom / oldViewport.zoom)
    }

    tween(t: number) {
        this.element.scroll.x = (1 - t) * this.oldViewport.scroll.x + t * this.newViewport.scroll.x
        this.element.scroll.y = (1 - t) * this.oldViewport.scroll.y + t * this.newViewport.scroll.y
        this.element.zoom = this.oldViewport.zoom * Math.exp(t * this.zoomFactor)
        return this.context.root
    }
}
