import {Action} from "../../base/intent/actions"
import {AbstractCommand, CommandExecutionContext} from "../../base/intent/commands"
import {SModelRoot, SModelElement} from "../../base/model/smodel"
import {isSelectable} from "../select/select"
import {isSizeable, BoundsAware, isBoundsAware} from "../resize/resize"
import {Bounds, combine, EMPTY_BOUNDS, center} from "../../utils/geometry"
import {Viewport, isViewport, ViewportAnimation} from "./viewport"
import {KeyListener} from "../../base/view/key-tool"
import {isCtrlOrCmd} from "../../utils/browser"

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
        if (isViewport(model) && isSizeable(model)) {
            this.oldViewport = {
                scroll: model.scroll,
                zoom: model.zoom
            }
            const allBounds: Bounds[] = []
            this.getElementIds().forEach(
                id => {
                    const element = model.index.getById(id)
                    if (element && isBoundsAware(element))
                        allBounds.push(element.bounds)
                }
            )
            if (allBounds.length == 0) {
                model.index.all().forEach(
                    element => {
                        if (isSelectable(element) && element.selected && isBoundsAware(element))
                            allBounds.push(element.bounds)
                    }
                )
            }
            if (allBounds.length == 0) {
                model.index.all().forEach(
                    element => {
                        if (isBoundsAware(element))
                            allBounds.push(element.bounds)
                    }
                )
            }
            const bounds = allBounds.reduce((b0, b1) => combine(b0, b1), EMPTY_BOUNDS)
            this.newViewport = this.getNewViewport(bounds, model)
        }
    }

    protected abstract getNewViewport(bounds: Bounds, model: SModelRoot & BoundsAware): Viewport

    protected abstract getElementIds(): string[]

    execute(model: SModelRoot, context: CommandExecutionContext) {
        this.initialize(model)
        return this.redo(model, context)
    }

    undo(model: SModelRoot, context: CommandExecutionContext) {
        if (isViewport(model) && this.newViewport)
            return new ViewportAnimation(model, this.newViewport, this.oldViewport, context).start()
        else
            return model
    }

    redo(model: SModelRoot, context: CommandExecutionContext) {
        if (isViewport(model) && this.newViewport)
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

    getNewViewport(bounds: Bounds, model: SModelRoot & BoundsAware) {
        const c = center(bounds)
        return {
            scroll: {
                x: c.x - 0.5 * model.bounds.width,
                y: c.y - 0.5 * model.bounds.height
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

    getNewViewport(bounds: Bounds, model: SModelRoot & BoundsAware) {
        const c = center(bounds)
        const zoom = Math.min(
            model.bounds.width / bounds.width,
            model.bounds.height / bounds.height)
        return {
            scroll: {
                x: c.x - 0.5 * model.bounds.width / zoom,
                y: c.y - 0.5 * model.bounds.height / zoom
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