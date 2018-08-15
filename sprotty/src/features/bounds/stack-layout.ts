/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point, isValidDimension } from '../../utils/geometry';
import { SParentElement, SChildElement } from "../../base/model/smodel";
import { AbstractLayout } from './abstract-layout';
import { AbstractLayoutOptions, HAlignment, VAlignment } from './layout-options';
import { BoundsData } from './hidden-bounds-updater';
import { LayoutContainer } from './model';
import { StatefulLayouter } from './layout';

export interface StackLayoutOptions extends AbstractLayoutOptions {
    paddingFactor: number
    vAlign: VAlignment
    hAlign: HAlignment
}

export class StackLayouter extends AbstractLayout<StackLayoutOptions> {

    static KIND = 'stack';

    protected getChildrenSize(container: SParentElement & LayoutContainer,
                            options: StackLayoutOptions,
                            layouter: StatefulLayouter) {
        let maxWidth = -1;
        let maxHeight = -1;
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds;
                if (bounds !== undefined && isValidDimension(bounds)) {
                    maxWidth = Math.max(maxWidth, bounds.width);
                    maxHeight = Math.max(maxHeight, bounds.height);
                }
            }
        );
        return {
            width: maxWidth,
            height: maxHeight
        };
    }

    protected layoutChild(child: SChildElement,
                        boundsData: BoundsData,
                        bounds: Bounds,
                        childOptions: StackLayoutOptions,
                        containerOptions: StackLayoutOptions,
                        currentOffset: Point,
                        maxWidth: number, maxHeight: number): Point {
        const dx = this.getDx(childOptions.hAlign, bounds, maxWidth);
        const dy = this.getDy(childOptions.vAlign, bounds, maxHeight);
        boundsData.bounds = {
            x: containerOptions.paddingLeft + (child as any).bounds.x - bounds.x + dx,
            y: containerOptions.paddingTop + (child as any).bounds.y - bounds.y + dy,
            width: bounds.width,
            height: bounds.height
        };
        boundsData.boundsChanged = true;
        return currentOffset;
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
        };
    }

    protected spread(a: StackLayoutOptions, b: StackLayoutOptions): StackLayoutOptions {
        return { ...a, ...b };
    }
}
