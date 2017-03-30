import { SModelElement, getParent } from "../../base/model/smodel"
import { MouseListener } from "../../base/view/mouse-tool"
import { Action } from "../../base/intent/actions"
import { ViewportAction } from "./viewport"
import { Viewport, isViewport } from "./model"

export interface Zoomable extends SModelExtension {
    zoom: number
}

export function isZoomable(element: SModelElement | Zoomable): element is Zoomable {
    return 'zoom' in element
}

export class ZoomMouseListener extends MouseListener {

    wheel(target: SModelElement, event: WheelEvent): Action[] {
        const viewport = getParent<Viewport>(target, isViewport)
        if (viewport) {
            const newZoom = Math.exp(-event.deltaY * 0.005)
            const factor = 1. / (newZoom * viewport.zoom) - 1. / viewport.zoom
            const newViewport: Viewport = {
                scroll: {
                    x: -(factor * event.offsetX - viewport.scroll.x),
                    y: -(factor * event.offsetY - viewport.scroll.y)
                },
                zoom: viewport.zoom * newZoom
            }
            return [new ViewportAction(viewport.id, newViewport, false)]
        }
        return []
    }
}