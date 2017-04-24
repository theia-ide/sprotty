/**
 * A Point is composed of the (x,y) coordinates of an object
 */
export interface Point {
    readonly x: number
    readonly y: number
}

/**
 * (x,y) coordinates of the origin
 */
export const ORIGIN_POINT: Point = Object.freeze({
    x: 0,
    y: 0
})

/**  
 * The Dimension of an object is composed of its width and height
 */
export interface Dimension {
    readonly width: number
    readonly height: number
}

/**
 * A dimension with both width and height set to a negative value, which is considered as undefined.
 */
export const EMPTY_DIMENSION: Dimension = Object.freeze({
    width: -1,
    height: -1
})

/** 
 * The bounds are the position (x, y) and dimension (width, height)
 * of an object
 */
export interface Bounds extends Point, Dimension {
}

export const EMPTY_BOUNDS: Bounds = Object.freeze({
    x: 0,
    y: 0,
    width: -1,
    height: -1
})

/**
 * Combines the bounds of two objects into one, so that the new 
 * bounds are the minimum bounds that covers both of the original 
 * bounds 
 * @param {Bounds} b0 - First bounds object
 * @param {Bounds} b1 - Second bounds object
 * @returns {Bounds} The combined bounds
 */
export function combine(b0: Bounds, b1: Bounds): Bounds {
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

/**
 * Returns the center point of the bounds of an object
 * @param {Bounds} b - Bounds object
 * @returns {Point} the center point
 */
export function center(b: Bounds): Point {
    if (isEmpty(b))
        return b
    else
        return {
            x: b.x + 0.5 * b.width,
            y: b.y + 0.5 * b.height
        }
}

/**
 * Checks whether the given bounds are empty, i.e. the width or height is not positive.
 * @param {Bounds} b - Bounds object
 * @returns {boolean} 
 */
export function isEmpty(b: Bounds): boolean {
    return b.width <= 0 || b.height <= 0
}

/**
 * Checks whether the point p is included in the bounds b.
 */
export function includes(b: Bounds, p: Point): boolean {
    return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height
}

/**
 * Represents an object's insets, for top, bottom, left and right
 */
export interface Insets {
    top: number
    bottom: number
    left: number
    right: number
}

/**
 * Enumeration of possible directions (left, right, up, down)
 */
export enum Direction { left, right, up, down }

/**
 * Returns the "straight line" distance between two points
 * @param {Point} a - First point
 * @param {Point} b - Second point
 * @returns {number} The eucledian distance
 */
export function euclideanDistance(a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Returns the distance between two points in a grid, using a 
 * strictly vertical and/or horizontal path (versus straight line)
 * @param {Point} a - First point
 * @param {Point} b - Second point
 * @returns {number} The manhattan distance
 */
export function manhattanDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
}

// range (-PI, PI]
export function angle(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Converts from radians to degrees
 * @param {number} a - A value in radians
 * @returns {number} The converted value
 */
export function toDegrees(a: number): number {
    return a * 180 / Math.PI
}

/**
 * Converts from degrees to radians
 * @param {number} a - A value in degrees
 * @returns {number} The converted value
 */
export function toRadians(a: number): number {
    return a * Math.PI / 180
}

/**
 * Returns whether two numbers are almost equal, within a small 
 * margin (0,001)
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {boolean} True if the two numbers are almost equal
 */
export function almostEquals(a: number, b: number): boolean {
    return Math.abs(a - b) < 1e-3
}
