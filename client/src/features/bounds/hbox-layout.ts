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
import { Layouting } from './model'

export type VAlignment = 'top' | 'center' | 'bottom'

export interface HBoxLayoutOptions {
    resizeContainer: boolean
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    hGap: number
    vAlign: VAlignment
}

export const DEFAULT_HBOX_LAYOUT_OPTIONS: HBoxLayoutOptions = {
    resizeContainer: true,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    hGap: 1,
    vAlign: 'center'
}

export class HBoxLayouter extends AbstractLayout {
    static KIND = 'hbox'

    layout(container: SParentElement & Layouting,
           layouter: StatefulLayouter) {
        const boundsData = layouter.getBoundsData(container)
        const options = this.getLayoutOptions(container)
        const maxHeight = options.resizeContainer
            ? this.getMaxHeight(container, layouter)
            : Math.max(0, this.getFixedContainerBounds(container, options, layouter).height) - options.paddingTop - options.paddingBottom
        if (maxHeight > 0) {
            let x = this.layoutChildren(container, layouter, options, maxHeight)
            if (options.resizeContainer) {
                boundsData.bounds = {
                    x: container.bounds.x,
                    y: container.bounds.y,
                    width: x - options.hGap + options.paddingRight,
                    height: maxHeight + options.paddingTop + options.paddingBottom
                }
                boundsData.boundsChanged = true
            }
        }
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

    protected layoutChildren(container: SParentElement & Layouting,
                             layouter: StatefulLayouter,
                             options: HBoxLayoutOptions,
                             maxHeight: number) {
        let x = options.paddingLeft
        container.children.forEach(
            child => {
                const boundsData = layouter.getBoundsData(child)
                const bounds = boundsData.bounds
                const layoutOptions = (child as any).layoutOptions
                const vAlign = (layoutOptions === undefined)
                    ? options.vAlign
                    : {...options, ...layoutOptions}.vAlign
                if (bounds !== undefined && isValidDimension(bounds)) {
                    let dy = 0
                    switch (vAlign) {
                        case 'top':
                            dy = 0
                            break
                        case 'center':
                            dy = 0.5 * (maxHeight - bounds.height)
                            break
                        case 'bottom':
                            dy = maxHeight - bounds.height
                    }
                    boundsData.bounds = {
                        x: x + (child as any).bounds.x - bounds.x,
                        y: options.paddingTop + (child as any).bounds.y - bounds.y + dy,
                        width: bounds.width,
                        height: bounds.height
                    }
                    boundsData.boundsChanged = true
                    x += bounds.width + options.hGap
                }
            }
        )
        return x
    }

    protected getLayoutOptions(element: SModelElement): HBoxLayoutOptions {
        let current = element
        const allOptions: HBoxLayoutOptions[] = []
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
            (a, b) => ({...a, ...b}), DEFAULT_HBOX_LAYOUT_OPTIONS)
    }
}