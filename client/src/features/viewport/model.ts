import { SModelElement } from "../../base/model/smodel"
import { Scrollable } from "./scroll"
import { Zoomable } from "./zoom"
import { BoundsInPageAware } from "../bounds/model"

export const viewportFeature = Symbol('viewportFeature')

export interface Viewport extends Scrollable, Zoomable {
}

export function isViewport(element: SModelElement): element is SModelElement & Viewport & BoundsInPageAware {
    return element.hasFeature(viewportFeature)
        && 'zoom' in element
        && 'scroll' in element
}
