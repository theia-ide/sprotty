import {Moveable} from "../features/move"
import {Sizeable} from "../features/resize/resize"

export interface Point {
    x: number
    y: number
}

export const ORIGIN_POINT: Point = {
    x: 0,
    y: 0
}

export interface Dimension {
    width: number
    height: number
}

export interface Bounds extends Point, Dimension {
}

export const EMPTY_BOUNDS: Bounds = {x: 0, y: 0, width: -1, height: -1}

export function getBounds(e: Moveable & Sizeable) {
    return {
        x: e.x, y: e.y, width: e.width, height: e.height
    }
}

export function combine(b0: Bounds, b1: Bounds) {
    if (isEmpty(b0))
        return b1
    if (isEmpty(b1))
        return b0
    const minX = Math.min(b0.x, b1.x)
    const minY = Math.min(b0.y, b1.y)
    const maxX = Math.max(b0.x + b0.width, b1.x + b1.width)
    const maxY = Math.max(b0.y + b0.height, b1.y + b1.height)
    return {
        x: minX, y: minY, width: maxX - minX, height: maxY - minY
    }
}

export function center(b: Bounds): Point {
    return { x: b.x + 0.5 * b.width, y: b.y + 0.5 * b.height }
}

export function isEmpty(b: Bounds) {
    return b.width < 0 || b.height < 0
}

export interface TransformMatrix {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
}

export const IDENTITY_MATRIX: TransformMatrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 0,
    e: 1,
    f: 0
}

export enum Direction { left, right, up, down }

export function euclideanDistance(a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
}

export function manhattanDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
}

export function almostEquals(a: number, b: number): boolean {
    return Math.abs(a - b) < 1e-3
}
