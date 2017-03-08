///<reference path="gmodel.ts"/>
import {Point} from "../../utils"
import {GModelElement} from "./gmodel"

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

