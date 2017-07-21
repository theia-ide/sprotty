/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point } from '../../utils/geometry'
import { SParentElement, SChildElement } from "../../base/model/smodel"
import { AbstractLayout } from './abstract-layout'
import { AbstractLayoutOptions, HAlignment } from './layout-options'
import { BoundsData } from './hidden-bounds-updater'
import { Layouting } from './model'

export interface VBoxLayoutOptions extends AbstractLayoutOptions {
    resizeContainer: boolean
    vGap: number
    hAlign: HAlignment
}

export class VBoxLayouter extends AbstractLayout<VBoxLayoutOptions> {

    static KIND = 'vbox'

    protected getFinalContainerBounds(container: SParentElement & Layouting,
                                    lastOffset: Point,
                                    options: VBoxLayoutOptions,
                                    maxWidth: number,
                                    maxHeight: number): Bounds {
        return {
            x: container.bounds.x,
            y: container.bounds.y,
            width: maxWidth + options.paddingLeft + options.paddingRight,
            height: lastOffset.y - options.vGap + options.paddingBottom
        }
    }

    protected layoutChild(child: SChildElement,
                        boundsData: BoundsData,
                        bounds: Bounds,
                        childOptions: VBoxLayoutOptions,
                        containerOptions: VBoxLayoutOptions,
                        currentOffset: Point,
                        maxWidth: number,
                        maxHeight: number) {
        const dx = this.getDx(childOptions.hAlign, bounds, maxWidth)
        boundsData.bounds = {
            x: containerOptions.paddingLeft + (child as any).bounds.x - bounds.x + dx,
            y: currentOffset.y + (child as any).bounds.y - bounds.y,
            width: bounds.width,
            height: bounds.height
        }
        boundsData.boundsChanged = true
        return {
            x: currentOffset.x,
            y: currentOffset.y + bounds.height + containerOptions.vGap
        }
    }

    protected getDefaultLayoutOptions(): VBoxLayoutOptions {
        return {
            resizeContainer: true,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5,
            paddingFactor: 1,
            vGap: 1,
            hAlign: 'center'
        }
    }

    protected spread(a: VBoxLayoutOptions, b: VBoxLayoutOptions): VBoxLayoutOptions {
        return { ...a, ...b }
    }
}