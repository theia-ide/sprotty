import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Scrollable } from "./scroll"
import { Zoomable } from "./zoom"

export const viewportFeature = Symbol('viewportFeature')

export interface Viewport extends Scrollable, Zoomable {
}

export function isViewport(element: SModelElement): element is SModelRoot & Viewport {
    return element instanceof SModelRoot
        && element.hasFeature(viewportFeature)
        && 'zoom' in element
        && 'scroll' in element
}
