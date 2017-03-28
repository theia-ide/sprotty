import { BehaviorSchema } from "../../base/model/behavior"
import { Locateable } from "../move/model"
import { Bounds, TransformMatrix } from "../../utils/geometry"
import { SModelElement } from "../../base/model/smodel"

export const resizeFeature = Symbol('resizeFeature')

export interface BoundsAware extends BehaviorSchema {
    autosize: boolean
    bounds: Bounds
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(resizeFeature)
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element
}
