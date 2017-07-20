/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { isValidDimension } from '../../utils/geometry'
import { SParentElement, SModelElement, SChildElement } from "../../base/model/smodel"
import { StatefulLayouter } from './layout'
import { AbstractLayout } from './abstract-layout'
import { Layouting } from './model';

export type HAlignment = 'left' | 'center' | 'right'

export interface VBoxLayoutOptions {
    resizeContainer: boolean
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    vGap: number
    hAlign: HAlignment
}

export const DEFAULT_VBOX_LAYOUT_OPTIONS: VBoxLayoutOptions = {
    resizeContainer: true,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    vGap: 1,
    hAlign: 'center'
}

export class VBoxLayouter extends AbstractLayout {
    static KIND = 'vbox'

    layout(container: SParentElement & Layouting,
           layouter: StatefulLayouter) {
        const boundsData = layouter.getBoundsData(container)
        const options = this.getLayoutOptions(container)
        const maxWidth = options.resizeContainer
            ? this.getMaxWidth(container, layouter)
            : Math.max(0, this.getFixedContainerBounds(container, options, layouter).width) - options.paddingLeft - options.paddingRight
        if (maxWidth > 0) {
            let y = this.layoutChildren(container, layouter, options, maxWidth)
            if (options.resizeContainer) {
                boundsData.bounds = {
                    x: container.bounds.x,
                    y: container.bounds.y,
                    width: maxWidth + options.paddingLeft + options.paddingRight,
                    height: y - options.vGap + options.paddingBottom
                }
                boundsData.boundsChanged = true
            }
        }
    }

    protected getMaxWidth(container: SParentElement & Layouting,
                          layouter: StatefulLayouter) {
        let maxWidth = -1
        container.children.forEach(
            child => {
                const bounds = layouter.getBoundsData(child).bounds
                if (bounds !== undefined && isValidDimension(bounds))
                    maxWidth = Math.max(maxWidth, bounds.width)
            }
        )
        return maxWidth
    }

    protected layoutChildren(container: SParentElement & Layouting,
                             layouter: StatefulLayouter,
                             options: VBoxLayoutOptions,
                             maxWidth: number) {
        let y = options.paddingTop
        container.children.forEach(
            child => {
                const boundsData = layouter.getBoundsData(child)
                const bounds = boundsData.bounds
                const layoutOptions = (child as any).layoutOptions
                const hAlign = (layoutOptions === undefined) 
                    ? options.hAlign 
                    : {...options, ...layoutOptions}.hAlign
                if (bounds !== undefined && isValidDimension(bounds)) {
                    let dx = 0
                    switch (hAlign) {
                        case 'left':
                            dx = 0
                            break
                        case 'center':
                            dx = 0.5 * (maxWidth - bounds.width)
                            break
                        case 'right':
                            dx = maxWidth - bounds.width
                    }
                    boundsData.bounds = {
                        x: options.paddingLeft + (child as any).bounds.x - bounds.x + dx,
                        y: y + (child as any).bounds.y - bounds.y,
                        width: bounds.width,
                        height: bounds.height
                    }
                    boundsData.boundsChanged = true
                    y += bounds.height + options.vGap
                }
            }
        )
        return y
    }

    protected getLayoutOptions(element: SModelElement): VBoxLayoutOptions {
        let current = element
        const allOptions: VBoxLayoutOptions[] = []
        while (true) {
            const layoutOptions = (current as any).layoutOptions
            if (layoutOptions !== undefined) 
                allOptions.push(layoutOptions)
            if (current instanceof SChildElement) 
                current = current.parent
            else
                break
        }
        return allOptions.reverse().reduce(
            (a,b) => ({...a, ...b}), DEFAULT_VBOX_LAYOUT_OPTIONS)
    }
}