export interface RGBColor {
    red: number
    green: number
    blue: number
}

export function toSVG(c: RGBColor): string {
    return 'rgb(' + Math.round(c.red * 255)
        + ',' + Math.round(c.green * 255)
        + ',' + Math.round(c.blue * 255) + ')'
}

export class ColorMap {

    constructor(private stops: RGBColor[]) {
    }

    getColor(t: number): RGBColor {
        t = Math.max(0, Math.min(0.99999999, t))
        const i = Math.floor(t * this.stops.length)
        return this.stops[i]
    }
}