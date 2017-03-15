export interface Point {
    x,y: number
}

export interface Dimension {
    width, height: number
}

export function almostEquals(a: number, b: number) {
    return Math.abs(a - b) < 1e-9
}

export enum Direction { left, right, up, down}