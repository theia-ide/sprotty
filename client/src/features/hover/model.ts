import { SModelElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const hoverFeature = Symbol('hoverFeature')

export interface Hoverable extends SModelExtension {
    mouseover: boolean
}

export function isHoverable(element: SModelElement): element is SModelElement & Hoverable {
    return element.hasFeature(hoverFeature)
}
