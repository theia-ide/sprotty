///<reference path="GModel.ts"/>
import {Point} from "../../utils/Geometry"
import {GModelElement} from "./GModel"

export interface Behavior {
}

export interface Moveable extends Behavior, Point {
    x: number
    y: number
}

export function isMoveable(element: GModelElement | Moveable): element is Moveable {
    return 'x' in element && 'y' in element
}

export interface Selectable extends Behavior {
    selected: boolean
}

export function isSelectable(element: GModelElement | Selectable): element is Selectable {
    return 'selected' in element
}

