/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ViewportRootElement } from './viewport-root';
import { SChildElement } from '../../base';
import { Action } from "../../base/intent/actions"
import { Command, CommandExecutionContext } from "../../base/intent/commands"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Bounds, center, combine, isValidDimension } from "../../utils/geometry"
import { KeyListener } from "../../base/view/key-tool"
import { isCtrlOrCmd } from "../../utils/browser"
import { isBoundsAware, isSizeable, BoundsAware } from "../bounds/model"
import { isSelectable } from "../select/model"
import { ViewportAnimation } from "./viewport"
import { isViewport, Viewport } from "./model"

export class CenterAction implements Action {
    readonly kind = CenterCommand.KIND

    constructor(public readonly elementIds: string[]) {
    }
}

export class FitToScreenAction implements Action {
    readonly kind = FitToScreenCommand.KIND

    constructor(public readonly elementIds: string[], 
                public readonly padding?: number, 
                public readonly maxZoom?: number) {
    }
}

abstract class BoundsAwareViewportCommand extends Command {

    oldViewport: Viewport
    newViewport: Viewport

    protected initialize(model: SModelRoot) {
        if (isViewport(model)) {
            this.oldViewport = {
                scroll: model.scroll,
                zoom: model.zoom
            }
            const allBounds: Bounds[] = []
            this.getElementIds().forEach(
                id => {
                    const element = model.index.getById(id)
                    if (element && isBoundsAware(element))
                        allBounds.push(this.boundsInViewport(element, element.bounds, model))
                }
            )
            if (allBounds.length === 0) {
                model.index.all().forEach(
                    element => {
                        if (isSelectable(element) && element.selected && isBoundsAware(element))
                            allBounds.push(this.boundsInViewport(element, element.bounds, model))
                    }
                )
            }
            if (allBounds.length === 0) {
                model.index.all().forEach(
                    element => {
                        if (isBoundsAware(element))
                            allBounds.push(this.boundsInViewport(element, element.bounds, model))
                    }
                )
            }
            const bounds = allBounds.reduce((b0, b1) => b0 === undefined ? b1 : combine(b0, b1), undefined)
            if (isValidDimension(bounds))
                this.newViewport = this.getNewViewport(bounds, model)
        }
    }

    protected boundsInViewport(element: SModelElement, bounds: Bounds, viewport: SModelRoot & Viewport): Bounds {
        if(element instanceof SChildElement && element.parent !== viewport)
            return this.boundsInViewport(element.parent, element.parent.localToParent(bounds) as Bounds, viewport)
        else 
            return bounds
    }

    protected abstract getNewViewport(bounds: Bounds, model: SModelRoot): Viewport

    protected abstract getElementIds(): string[]

    execute(context: CommandExecutionContext) {
        this.initialize(context.root)
        return this.redo(context)
    }

    undo(context: CommandExecutionContext) {
        const model = context.root
        if (isViewport(model) && this.newViewport && !this.equal(this.newViewport, this.oldViewport))
            return new ViewportAnimation(model, this.newViewport, this.oldViewport, context).start()
        else
            return model
    }

    redo(context: CommandExecutionContext) {
        const model = context.root
        if (isViewport(model) && this.newViewport && !this.equal(this.newViewport, this.oldViewport))
            return new ViewportAnimation(model, this.oldViewport, this.newViewport, context).start()
        else
            return model
    }

    protected equal(vp1: Viewport, vp2: Viewport): boolean {
        return vp1.zoom === vp2.zoom && vp1.scroll.x === vp2.scroll.x && vp1.scroll.y === vp2.scroll.y
    }
}

export class CenterCommand extends BoundsAwareViewportCommand {
    static readonly KIND = 'center'

    constructor(protected action: CenterAction) {
        super()
    }

    getElementIds() {
        return this.action.elementIds
    }

    getNewViewport(bounds: Bounds, model: SModelRoot) {
        const c = center(bounds)
        return {
            scroll: {
                x: c.x - 0.5 * model.canvasBounds.width,
                y: c.y - 0.5 * model.canvasBounds.height
            },
            zoom: 1
        }
    }
}

export class FitToScreenCommand extends BoundsAwareViewportCommand {
    static readonly KIND = 'fit'

    constructor(protected action: FitToScreenAction) {
        super()
    }

    getElementIds() {
        return this.action.elementIds
    }

    getNewViewport(bounds: Bounds, model: SModelRoot) {
        const c = center(bounds)
        const delta = this.action.padding === undefined
            ? 0
            : 2 *  this.action.padding
        let zoom = Math.min(
            model.canvasBounds.width / (bounds.width + delta),
            model.canvasBounds.height / bounds.height + delta)
        if (this.action.maxZoom !== undefined) 
           zoom = Math.min(zoom, this.action.maxZoom) 
        return {
            scroll: {
                x: c.x - 0.5 * model.canvasBounds.width / zoom,
                y: c.y - 0.5 * model.canvasBounds.height / zoom
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