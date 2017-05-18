/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Insets } from "../../utils/geometry"
import { SModelElement, SParentElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const boundsFeature = Symbol('boundsFeature')
export const layoutFeature = Symbol('layoutFeature')

export interface BoundsAware extends SModelExtension {
    bounds: Bounds
}

export interface Layouting extends SModelExtension {
    layout: string
    resizeContainer: boolean
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

