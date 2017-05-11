import { SModelElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const hoverFeedbackFeature = Symbol('hoverFeedbackFeature')

export interface Hoverable extends SModelExtension {
    hoverFeedback: boolean
}

export function isHoverable(element: SModelElement): element is SModelElement & Hoverable {
    return element.hasFeature(hoverFeedbackFeature)
}

export const popupFeature = Symbol('popupFeature')

export function hasPopupFeature(element: SModelElement): element is SModelElement {
    return element.hasFeature(popupFeature)
}