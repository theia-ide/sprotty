import { SModelElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const hoverFeature = Symbol('hoverFeature')

export interface Hoverable extends SModelExtension {
    mouseover: boolean
}

export function isHoverable(element: SModelElement): element is SModelElement & Hoverable {
    return element.hasFeature(hoverFeature)
}

export const popupFeature = Symbol('popupFeature')

export interface PopupFeature extends SModelExtension {

}

export function hasPopupFeature(element: SModelElement): element is SModelElement & PopupFeature {
    return element.hasFeature(popupFeature)
}