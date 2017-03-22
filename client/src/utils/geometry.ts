export interface Point {
    x: number
    y: number
}

export interface Dimension {
    width: number
    height: number
}

export interface Bounds extends Point, Dimension {
}

export const EMPTY_BOUNDS: Bounds = {x: 0, y: 0, width: -1, height: -1}

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
