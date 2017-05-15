import { Point } from "../../utils/geometry"
import { SModelElement } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action } from "../../base/intent/actions"
import { SModelExtension } from "../../base/model/smodel-extension"
import { findParentByFeature } from "../../base/model/smodel-utils"
import { ViewportAction } from "./viewport"
import { isViewport, Viewport } from "./model"

export interface Scrollable extends SModelExtension {
    scroll: Point
}

export function isScrollable(element: SModelElement | Scrollable): element is Scrollable {
    return 'scroll' in element
}

export class ScrollMouseListener extends MouseListener {

    lastScrollPosition: Point |undefined

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button == 2) {
            const viewport = findParentByFeature(target, isViewport)
            if (viewport)
                this.lastScrollPosition = {x: event.pageX, y: event.pageY}
            else
                this.lastScrollPosition = undefined
        }
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        if (this.lastScrollPosition) {
            const viewport = findParentByFeature(target, isViewport)
            if (viewport) {
                const dx = (event.pageX - this.lastScrollPosition.x) / viewport.zoom
                const dy = (event.pageY - this.lastScrollPosition.y) / viewport.zoom
                const newViewport: Viewport = {
                    scroll: {
                        x: viewport.scroll.x - dx,
                        y: viewport.scroll.y - dy,
                    },
                    zoom: viewport.zoom
                }
                this.lastScrollPosition = {x: event.pageX, y: event.pageY}
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
