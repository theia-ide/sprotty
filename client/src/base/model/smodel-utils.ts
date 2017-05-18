/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SChildElement, SModelElement, SModelElementSchema } from "./smodel"
import { Bounds, EMPTY_BOUNDS } from "../../utils/geometry"
import { isBoundsAware } from "../../features/bounds/model"

export function getBasicType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(0, colonIndex)
    else
        return schema.type
}

export function getSubType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(colonIndex + 1)
    else
        return schema.type
}

export function findParent(element: SModelElement, predicate: (e: SModelElement) => boolean): SModelElement | undefined {
    let current: SModelElement | undefined = element
    while (current !== undefined) {
        if (predicate(current))
            return current
        else if (current instanceof SChildElement)
            current = current.parent
        else
            current = undefined
    }
    return current
}

export function findParentByFeature<T>(element: SModelElement, predicate: (t: SModelElement) => t is SModelElement & T): SModelElement & T | undefined {
    let current: SModelElement | undefined = element
    while (current !== undefined) {
        if (predicate(current))
            return current
        else if (current instanceof SChildElement)
            current = current.parent
        else
            current = undefined
    }
    return current
}

export function getAbsoluteBounds(element: SModelElement): Bounds {
    const boundsAware = findParentByFeature(element, isBoundsAware)
    if (boundsAware !== undefined) {
        let bounds = boundsAware.bounds
        let current: SModelElement = boundsAware
        while (current instanceof SChildElement) {
            const parent = current.parent
            bounds = parent.localToParent(bounds)
            current = parent
        }
        return bounds
    } else {
        return EMPTY_BOUNDS
    }
}
