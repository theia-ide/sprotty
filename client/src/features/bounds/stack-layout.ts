/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point } from '../../utils/geometry'
import { SChildElement, SParentElement } from "../../base/model/smodel"
import { AbstractLayout } from './abstract-layout'
import { AbstractLayoutOptions, HAlignment, VAlignment } from './layout-options'
import { BoundsData } from './hidden-bounds-updater'
import { Layouting } from './model'

export interface StackLayoutOptions extends AbstractLayoutOptions {
    paddingFactor: number
    vAlign: VAlignment
    hAlign: HAlignment
}

export class StackLayouter extends AbstractLayout<StackLayoutOptions> {

    static KIND = 'stack'

    protected layoutChild(child: SChildElement,
                        boundsData: BoundsData,
                        bounds: Bounds,
                        childOptions: StackLayoutOptions,
                        containerOptions: StackLayoutOptions,
                        currentOffset: Point,
                        maxWidth: number, maxHeight: number): Point {
        const dx = this.getDx(childOptions.hAlign, bounds, maxWidth * containerOptions.paddingFactor)
        const dy = this.getDy(childOptions.vAlign, bounds, maxHeight * containerOptions.paddingFactor)
        boundsData.bounds = {
            x: containerOptions.paddingLeft + (child as any).bounds.x - bounds.x + dx,
            y: containerOptions.paddingTop + (child as any).bounds.y - bounds.y + dy,
            width: bounds.width,
            height: bounds.height
        }
        boundsData.boundsChanged = true
        return currentOffset
    }

    protected getFinalContainerBounds(container: SParentElement & Layouting,
                                    lastOffset: Point,
                                    options: StackLayoutOptions,
                                    maxWidth: number,
                                    maxHeight: number): Bounds {
        return {
            x: container.bounds.x,
            y: container.bounds.y,
            width: maxWidth * options.paddingFactor + options.paddingLeft + options.paddingRight,
            height: maxHeight * options.paddingFactor + options.paddingTop + options.paddingBottom
        }
    }

    protected getDefaultLayoutOptions(): StackLayoutOptions {
        return {
            resizeContainer: true,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5,
            paddingFactor: 1,
            hAlign: 'center',
            vAlign: 'center'
        }
    }

    protected spread(a: StackLayoutOptions, b: StackLayoutOptions): StackLayoutOptions {
        return { ...a, ...b }
    }
}