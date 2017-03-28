import { BehaviorSchema } from "../../base/model/behavior"
import { Point } from "../../utils/geometry"
import { SModelElement } from "../../base/model/smodel"

export const moveFeature = Symbol('moveFeature')

export interface Locateable extends BehaviorSchema {
    position: Point
}

export function isMoveable(element: SModelElement): element is SModelElement & Locateable {
    return element.hasFeature(moveFeature)
}
