import { Bounds, Insets } from "../../utils/geometry"
import { SModelElement, SParentElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const boundsFeature = Symbol('boundsFeature')
export const layoutFeature = Symbol('layoutFeature')

export interface BoundsAware extends SModelExtension {
    bounds: Bounds
}

export interface BoundsInPageAware extends SModelExtension {
    boundsInPage: Bounds
}

export interface Layouting extends SModelExtension {
    layout: string
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element
}

export function isBoundsInPageAware(element: SModelElement): element is SModelElement & BoundsInPageAware {
    return 'boundsInPage' in element
}

export function isLayouting(element: SModelElement): element is SParentElement & Layouting & BoundsAware {
    return 'layout' in element && isBoundsAware(element) && element.hasFeature(layoutFeature)
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(boundsFeature) && isBoundsAware(element)
}

