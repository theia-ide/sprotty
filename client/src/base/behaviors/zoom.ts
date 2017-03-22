import {SModelElement} from "../model/smodel"
import {BehaviorSchema} from "../model/behavior"

export interface Zoomable extends BehaviorSchema {
    zoom: number
}

export function isZoomable(element: SModelElement | Zoomable): element is Zoomable {
    return 'zoom' in element
}