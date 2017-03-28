import { BehaviorSchema } from "../../base/model/behavior"
import { SModelElement } from "../../base/model/smodel"

export const selectFeature = Symbol('selectFeature')

export interface Selectable extends BehaviorSchema {
    selected: boolean
}

export function isSelectable(element: SModelElement): element is SModelElement & Selectable {
    return element.hasFeature(selectFeature)
}
