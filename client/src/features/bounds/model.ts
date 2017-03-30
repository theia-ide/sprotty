import { Bounds } from "../../utils/geometry"
import { SModelElement } from "../../base/model/smodel"

export const boundsFeature = Symbol('boundsFeature')

export interface BoundsAware extends SModelExtension {
    bounds: Bounds
}

export interface BoundsInPageAware extends SModelExtension {
    boundsInPage: Bounds
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element
}

export function isBoundsInPageAware(element: SModelElement): element is SModelElement & BoundsInPageAware {
    return 'boundsInPage' in element
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(boundsFeature) && isBoundsAware(element)
}

