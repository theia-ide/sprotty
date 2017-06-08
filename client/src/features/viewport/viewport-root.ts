/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point, isBounds, isValidDimension } from "../../utils/geometry"
import { SModelRoot } from "../../base/model/smodel"
import { Viewport, viewportFeature } from "./model"

export class ViewportRootElement extends SModelRoot implements Viewport {
    scroll: Point = { x: 0, y: 0 }
    zoom: number = 1

    hasFeature(feature: symbol) {
        return feature === viewportFeature
    }

    localToParent(point: Point | Bounds): Bounds {
        if (isBounds(point) && isValidDimension(point)) {
            return {
                x: (point.x - this.scroll.x) * this.zoom,
                y: (point.y - this.scroll.y) * this.zoom,
                width: point.width * this.zoom,
                height: point.height * this.zoom
            }
        } else {
            return {
                x: (point.x - this.scroll.x) * this.zoom,
                y: (point.y - this.scroll.y) * this.zoom,
                width: -1,
                height: -1
            }
        }
    }
}