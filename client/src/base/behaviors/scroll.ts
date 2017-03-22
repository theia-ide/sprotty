import {SModelElement, SModel} from "../model/smodel"
import {Point} from "../../utils/geometry"
import {BehaviorSchema} from "../model/behavior"
import {MouseListener} from "../view/mouse-tool"
import {Action} from "../intent/actions"
import {isViewport, Viewport, ViewportAction} from "./viewport"

export interface Scrollable extends BehaviorSchema {
    scroll: Point
}

export function isScrollable(element: SModelElement | Scrollable): element is Scrollable {
    return 'scroll' in element
}

export class ScrollMouseListener extends MouseListener {

    lastScrollPosition: Point |undefined

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button == 2) {
            const viewport = SModel.getParent<Viewport>(target, isViewport)
            if(viewport)
                this.lastScrollPosition = {x: event.clientX, y: event.clientY}
            else
                this.lastScrollPosition = undefined
        }
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        if(this.lastScrollPosition) {
            const viewport = SModel.getParent<Viewport>(target, isViewport)
            if(viewport) {
                const dx = (event.clientX - this.lastScrollPosition.x) / viewport.zoom
                const dy = (event.clientY - this.lastScrollPosition.y) / viewport.zoom
                const newViewport: Viewport = {
                    scroll: {
                        x: viewport.scroll.x - dx,
                        y: viewport.scroll.y - dy,
                    },
                    zoom: viewport.zoom
                }
                this.lastScrollPosition = {x: event.clientX, y: event.clientY}
                return [new ViewportAction(viewport.id, newViewport, false)]
            }
        }
        return []
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        this.lastScrollPosition = undefined
        return []
    }
}