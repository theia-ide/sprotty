import { BehaviorSchema } from "../../base/model/behavior"
import { Locateable } from "../move/model"
import { Bounds, TransformMatrix } from "../../utils/geometry"
import { SModelElement } from "../../base/model/smodel"

export const boundsFeature = Symbol('boundsFeature')

export interface BoundsAware extends BehaviorSchema {
    autosize: boolean
    bounds: Bounds
}

export interface BoundsInPageAware extends BoundsAware {
    boundsInPage: Bounds
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element && 'autosize' in element
}

export function isBoundsInPageAware(element: SModelElement): element is SModelElement & BoundsInPageAware {
    return 'boundsInPage' in element
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(boundsFeature) && isBoundsAware(element)
}

