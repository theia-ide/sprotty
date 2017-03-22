import {SModelElement} from "../model/smodel"
import {Point} from "../../utils/geometry"
import {BehaviorSchema} from "../model/behavior"

export interface Scrollable extends BehaviorSchema {
    scroll: Point
}

export function isScrollable(element: SModelElement | Scrollable): element is Scrollable {
    return 'scroll' in element
}

