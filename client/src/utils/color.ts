export interface RGBColor {
    red: number
    green: number
    blue: number
}

export function rgb(red: number, green: number, blue: number): RGBColor {
    return {
        red: red,
        green: green,
        blue: blue
    }
}

export function toSVG(c: RGBColor): string {
    return 'rgb(' + c.red + ',' + c.green + ',' + c.blue + ')'
}

export class ColorMap {

    constructor(protected stops: RGBColor[]) {
    }

    getColor(t: number): RGBColor {
        t = Math.max(0, Math.min(0.99999999, t))
        const i = Math.floor(t * this.stops.length)
        return this.stops[i]
    }
}