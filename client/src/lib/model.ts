/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelRoot, SModelRootSchema, SChildElement, SModelElementSchema } from "../base/model/smodel"
import { Point, Dimension, ORIGIN_POINT, EMPTY_DIMENSION, Bounds } from "../utils/geometry"
import { BoundsAware, boundsFeature, Alignable, alignFeature } from "../features/bounds/model"
import { Locateable, moveFeature } from "../features/move/model"
import { Selectable, selectFeature } from "../features/select/model"

export interface HtmlRootSchema extends SModelRootSchema {
    classes?: string[]
}

export class HtmlRoot extends SModelRoot {
    classes: string[] = []
}

export interface PreRenderedElementSchema extends SModelElementSchema {
    code: string
}

export class PreRenderedElement extends SChildElement {
    code: string
}

export interface ShapedPreRenderedElementSchema extends PreRenderedElementSchema {
    position?: Point
    size?: Dimension
}

export class ShapedPreRenderedElement extends PreRenderedElement implements BoundsAware, Locateable, Selectable, Alignable {
    position: Point = ORIGIN_POINT
    size: Dimension = EMPTY_DIMENSION
    selected: boolean = false
    alignment: Point = ORIGIN_POINT

    get bounds(): Bounds {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height
        }
    }

    set bounds(newBounds: Bounds) {
        this.position = {
            x: newBounds.x,
            y: newBounds.y
        }
        this.size = {
            width: newBounds.width,
            height: newBounds.height
        }
    }

    hasFeature(feature: symbol): boolean {
        return feature === moveFeature || feature === boundsFeature || feature === selectFeature || feature === alignFeature
    }
}
