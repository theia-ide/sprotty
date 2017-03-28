import { BehaviorSchema } from "../../base/model/behavior"
import { SModelElement } from "../../base/model/smodel"
import { Scrollable } from "./scroll"
import { Zoomable } from "./zoom"

export const viewportFeature = Symbol('viewportFeature')

export interface Viewport extends BehaviorSchema, Scrollable, Zoomable {
}

export function isViewport(element: SModelElement): element is SModelElement & Viewport & Scrollable & Zoomable {
    return element.hasFeature(viewportFeature)
        && 'zoom' in element
        && 'scroll' in element
}
