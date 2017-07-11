/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, EMPTY_BOUNDS, Point } from "../../utils/geometry"
import { SModelElement, SParentElement, SChildElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"
import { findParentByFeature } from '../../base/model/smodel-utils'

export const boundsFeature = Symbol('boundsFeature')
export const layoutFeature = Symbol('layoutFeature')
export const alignFeature = Symbol('alignFeature')

export interface BoundsAware extends SModelExtension {
    bounds: Bounds
}

export interface Layouting extends SModelExtension {
    layout: string
    resizeContainer: boolean
}

/**
 * Used to adjust elements whose bounding box is not at the origin, e.g.
 * labels, or pre-rendered SVG figures.
 */
export interface Alignable extends SModelExtension {
    alignment: Point
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element
}

export function isLayouting(element: SModelElement): element is SParentElement & Layouting & BoundsAware {
    return 'layout' in element
        && 'resizeContainer' in element
        && isBoundsAware(element)
        && element.hasFeature(layoutFeature)
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(boundsFeature) && isBoundsAware(element)
}

export function isAlignable(element: SModelElement): element is SModelElement & Alignable {
    return 'alignment' in element
        && element.hasFeature(alignFeature)
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
