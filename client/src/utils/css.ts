/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export function getCssFloatValue(style: CSSStyleDeclaration | undefined,
        property: string,
        defaultValue: number): number {
    if (style) {
        const stringVal = style.getPropertyValue(property)
        if (stringVal) {
            const floatVal = parseFloat(stringVal)
            if (!isNaN(floatVal)) {
                return floatVal
            }
        }
    }
    return defaultValue
}

export function  getCssStringValue(style: CSSStyleDeclaration | undefined,
        property: string,
        defaultValue: string): string {
    if (style) {
        const stringVal = style.getPropertyValue(property)
        if (stringVal)
            return stringVal
    }
    return defaultValue
}