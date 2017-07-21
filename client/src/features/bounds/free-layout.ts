/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, EMPTY_BOUNDS, Point, isValidDimension, Dimension, combine } from '../../utils/geometry'
import { SChildElement, SParentElement } from "../../base/model/smodel"
import { AbstractLayout } from './abstract-layout'
import { AbstractLayoutOptions} from './layout-options'
import { BoundsData } from './hidden-bounds-updater'
import { Layouting } from './model'
import { StatefulLayouter } from './layout'

export interface FreeLayoutOptions extends AbstractLayoutOptions {
    paddingFactor: number
}

/**
 * Does not really layout any children
 */
export class FreeLayouter extends AbstractLayout<FreeLayoutOptions> {

    static KIND = 'free'

    protected layoutChild(child: SChildElement,
                        boundsData: BoundsData,
                        bounds: Bounds,
                        childOptions: FreeLayoutOptions,
                        containerOptions: FreeLayoutOptions,
                        currentOffset: Point,
                        maxWidth: number, maxHeight: number): Point {
        return currentOffset
    }

    protected getMaxChildrenSize(container: SParentElement & Layouting,
                                layouter: StatefulLayouter): Dimension {
        let allBounds = EMPTY_BOUNDS
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds
                if (bounds !== undefined && isValidDimension(bounds))
                    allBounds = combine(allBounds, bounds)
            }
        )
        return allBounds
    }

    protected getMaxHeight(container: SParentElement & Layouting,
                          layouter: StatefulLayouter) {
        let maxHeight = -1
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds
                if (bounds !== undefined && isValidDimension(bounds))
                    maxHeight = Math.max(maxHeight, bounds.height)
            }
        )
        return maxHeight
    }

    protected getFinalContainerBounds(container: SParentElement & Layouting,
                                    lastOffset: Point,
                                    options: FreeLayoutOptions,
                                    maxWidth: number,
                                    maxHeight: number): Bounds {
        return {
            x: container.bounds.x,
            y: container.bounds.y,
            width: maxWidth,
            height: maxHeight
        }
    }

    protected getDefaultLayoutOptions(): FreeLayoutOptions {
        return {
            resizeContainer: true,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingFactor: 1
        }
    }

    protected spread(a: FreeLayoutOptions, b: FreeLayoutOptions): FreeLayoutOptions {
        return { ...a, ...b }
    }
}