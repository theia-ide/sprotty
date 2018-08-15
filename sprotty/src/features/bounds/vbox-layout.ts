/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point, isValidDimension } from '../../utils/geometry';
import { SParentElement, SChildElement } from "../../base/model/smodel";
import { AbstractLayout } from './abstract-layout';
import { AbstractLayoutOptions, HAlignment } from './layout-options';
import { BoundsData } from './hidden-bounds-updater';
import { LayoutContainer } from './model';
import { StatefulLayouter } from './layout';

export interface VBoxLayoutOptions extends AbstractLayoutOptions {
    vGap: number
    hAlign: HAlignment
}

/**
 * Layouts children of a container in vertical (top->bottom) direction.
 */
export class VBoxLayouter extends AbstractLayout<VBoxLayoutOptions> {

    static KIND = 'vbox';

    protected getChildrenSize(container: SParentElement & LayoutContainer,
                               containerOptions: VBoxLayoutOptions,
                               layouter: StatefulLayouter) {
        let maxWidth = -1;
        let maxHeight = 0;
        let isFirst = true;
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds;
                if (bounds !== undefined && isValidDimension(bounds)) {
                    maxHeight += bounds.height;
                    if (isFirst)
                        isFirst = false;
                    else
                        maxHeight += containerOptions.vGap;
                    maxWidth = Math.max(maxWidth, bounds.width);
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
                        childOptions: VBoxLayoutOptions,
                        containerOptions: VBoxLayoutOptions,
                        currentOffset: Point,
                        maxWidth: number,
                        maxHeight: number) {
        const dx = this.getDx(childOptions.hAlign, bounds, maxWidth);
        boundsData.bounds = {
            x: containerOptions.paddingLeft + (child as any).bounds.x - bounds.x + dx,
            y: currentOffset.y + (child as any).bounds.y - bounds.y,
            width: bounds.width,
            height: bounds.height
        };
        boundsData.boundsChanged = true;
        return {
            x: currentOffset.x,
            y: currentOffset.y + bounds.height + containerOptions.vGap
        };
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
        };
    }

    protected spread(a: VBoxLayoutOptions, b: VBoxLayoutOptions): VBoxLayoutOptions {
        return { ...a, ...b };
    }
}
