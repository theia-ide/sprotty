import {Action} from "../../base/intent/actions"
import {AbstractCommand, CommandExecutionContext} from "../../base/intent/commands"
import {SModelRoot, SModelElement} from "../../base/model/smodel"
import {isSelectable} from "../select/select"
import {isSizeable, Sizeable} from "../resize/resize"
import {Bounds, getBounds, combine, EMPTY_BOUNDS, center} from "../../utils/geometry"
import {isMoveable} from "../move"
import {Viewport, isViewport, ViewportAnimation} from "./viewport"
import {KeyListener} from "../../base/view/key-tool"
import {isCtrlOrCmd} from "../../utils/utils"

export class CenterAction implements Action {
    readonly kind = CenterCommand.KIND

    constructor(public readonly elementIds: string[]) {
    }
}

export class FitToScreenAction implements Action {
    readonly kind = FitToScreenCommand.KIND

    constructor(public readonly elementIds: string[]) {
    }
}

export abstract class AbstractViewportCommand extends AbstractCommand {

    oldViewport: Viewport
    newViewport: Viewport

    protected initialize(model: SModelRoot) {
        if (isViewport(model) && isSizeable(model) && model.clientBounds) {
            this.oldViewport = {
                scroll: model.scroll,
                zoom: model.zoom
            }
            const allBounds: Bounds[] = []
            this.getElementIds().forEach(
                id => {
                    const element = model.index.getById(id)
                    if (element && isSizeable(element) && isMoveable(element))
                        allBounds.push(getBounds(element))
                }
            )
            if (allBounds.length == 0) {
                model.index.all().forEach(
                    element => {
                        if (isSelectable(element) && element.selected && isSizeable(element) && isMoveable(element))
                            allBounds.push(getBounds(element))
                    }
                )
            }
            if (allBounds.length == 0) {
                model.index.all().forEach(
                    element => {
                        if (isSizeable(element) && isMoveable(element))
                            allBounds.push(getBounds(element))
                    }
                )
            }
            const bounds = allBounds.reduce((b0, b1) => combine(b0, b1), EMPTY_BOUNDS)
            this.newViewport = this.getNewViewport(bounds, model)
        }
        return undefined
    }

    protected abstract getNewViewport(bounds: Bounds, model: SModelRoot & Sizeable): Viewport

    protected abstract getElementIds(): string[]

    execute(model: SModelRoot, context: CommandExecutionContext) {
        this.initialize(model)
        return this.redo(model, context)
    }

    undo(model: SModelRoot, context: CommandExecutionContext) {
        if(isViewport(model) && this.newViewport)
            return new ViewportAnimation(model, this.newViewport, this.oldViewport, context).start()
        else
            return model
    }

    redo(model: SModelRoot, context: CommandExecutionContext) {
        if(isViewport(model) && this.newViewport)
            return new ViewportAnimation(model, this.oldViewport, this.newViewport, context).start()
        else
            return model
    }
}

export class CenterCommand extends AbstractViewportCommand {
    static readonly KIND = 'center'

    constructor(protected action: CenterAction) {
        super()
    }

    getElementIds() {
        return this.action.elementIds
    }

    getNewViewport(bounds, model) {
        const c = center(bounds)
        return {
            scroll: {
                x: c.x - 0.5 * model.clientBounds.width,
                y: c.y - 0.5 * model.clientBounds.height
            },
            zoom: 1
        }
    }
}

export class FitToScreenCommand extends AbstractViewportCommand {
    static readonly KIND = 'fit'

    constructor(protected action: CenterAction) {
        super()
    }

    getElementIds() {
        return this.action.elementIds
    }

    getNewViewport(bounds, model) {
        const c = center(bounds)
        const zoom = Math.min(
            model.clientBounds.width / bounds.width,
            model.clientBounds.height / bounds.height)
        return {
            scroll: {
                x: c.x - 0.5 * model.clientBounds.width / zoom,
                y: c.y - 0.5 * model.clientBounds.height / zoom
            },
            zoom: zoom
        }
    }
}

export class CenterKeyboardListener extends KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        if (isCtrlOrCmd(event)) {
            switch (event.keyCode) {
                case 67:
                    return [new CenterAction([])]
                case 70:
                    return [new FitToScreenAction([])]
            }
        }
        return []
    }
}