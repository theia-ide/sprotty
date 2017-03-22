///<reference path="smodel.ts"/>
import {Point, Dimension} from "../../utils"
import {SModelElement} from "./smodel"
import {Bounds} from "../../utils/geometry"

export interface Behavior {
}

export interface Moveable extends Behavior, Point {
    x: number
    y: number
}

export function isMoveable(element: SModelElement | Moveable): element is Moveable {
    return 'x' in element && 'y' in element
}

export interface Selectable extends Behavior {
    selected: boolean
}

export function isSelectable(element: SModelElement | Selectable): element is Selectable {
    return 'selected' in element
}

export interface Sizeable extends Behavior, Dimension {
    autosize: boolean
    clientBounds?: Bounds
}

export function isSizeable(element: SModelElement | Sizeable): element is Sizeable {
    return 'autosize' in element
        && 'width' in element
        && 'height' in element
}

export interface Scrollable {
    scroll: Point
}

export function isScrollable(element: SModelElement | Scrollable): element is Scrollable {
    return 'scroll' in element
}

export interface Zoomable {
    zoom: number
}

export function isZoomable(element: SModelElement | Zoomable): element is Zoomable {
    return 'zoom' in element
}

export interface Viewport extends Behavior, Scrollable, Zoomable {
}

export function isViewport(element: SModelElement | Viewport): element is Viewport & Scrollable & Zoomable {
    return 'zoom' in element
        && 'scroll' in element
}
