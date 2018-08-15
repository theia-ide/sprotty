/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

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
    };
}

export function toSVG(c: RGBColor): string {
    return 'rgb(' + c.red + ',' + c.green + ',' + c.blue + ')';
}

export class ColorMap {

    constructor(protected stops: RGBColor[]) {
    }

    getColor(t: number): RGBColor {
        t = Math.max(0, Math.min(0.99999999, t));
        const i = Math.floor(t * this.stops.length);
        return this.stops[i];
    }
}
