export interface Point {
    x,y: number
}

export interface Dimension {
    width, height: number
}

export interface Bounds extends Point, Dimension {
}

export const EMPTY_BOUNDS: Bounds = {x: 0, y: 0, width: -1, height: -1}

export function almostEquals(a: number, b: number) {
    return Math.abs(a - b) < 1e-3
}

export enum Direction { left, right, up, down }
