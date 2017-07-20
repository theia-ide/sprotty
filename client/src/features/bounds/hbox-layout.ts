/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { VNode } from "snabbdom/vnode"
import { isValidDimension } from '../../utils/geometry'
import { SParentElement } from "../../base/model/smodel"
import { StatefulLayouter } from './layout'
import { AbstractLayout } from './abstract-layout'
import { Layouting } from './model'

/**
 * CSS properties understood by the HBoxLayouter
 */
export interface HBoxProperties {
    lineHeight: number
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    verticalAlign: string
}

export class HBoxLayouter extends AbstractLayout {
    static KIND = 'hbox'

    layout(container: SParentElement & Layouting,
           layouter: StatefulLayouter) {
        const boundsData = layouter.getBoundsData(container)
        const properties = this.getLayoutProperties(boundsData.vnode)
        const maxHeight = container.resizeContainer
            ? this.getMaxHeight(container, layouter)
            : Math.max(0, this.getFixedContainerBounds(container, layouter).height) - properties.paddingTop - properties.paddingBottom
        if (maxHeight > 0) {
            let x = this.layoutChildren(container, layouter, properties, maxHeight)
            if (container.resizeContainer) {
                boundsData.bounds = {
                    x: container.bounds.x,
                    y: container.bounds.y,
                    width: x - properties.lineHeight + properties.paddingRight,
                    height: maxHeight + properties.paddingTop + properties.paddingBottom
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
                             properties: HBoxProperties,
                             maxHeight: number) {
        let x = properties.paddingLeft
        container.children.forEach(
            child => {
                const boundsData = layouter.getBoundsData(child)
                const bounds = boundsData.bounds
                const textAlign = this.getLayoutProperties(boundsData.vnode).verticalAlign
                if (bounds !== undefined && isValidDimension(bounds)) {
                    let dy = 0
                    if (textAlign === 'top')
                        dy = 0
                    else if (textAlign === 'middle')
                        dy = 0.5 * (maxHeight - bounds.height)
                    else if (textAlign === 'bottom')
                        dy = maxHeight - bounds.height
                    boundsData.bounds = {
                        x: x + (child as any).bounds.x - bounds.x,
                        y: properties.paddingTop + (child as any).bounds.y - bounds.y + dy,
                        width: bounds.width,
                        height: bounds.height
                    }
                    boundsData.boundsChanged = true
                    x += bounds.width + properties.lineHeight
                }
            }
        )
        return x
    }

    protected getLayoutProperties(vnode: VNode | undefined): HBoxProperties {
        const style = (vnode && vnode.elm) ? getComputedStyle(vnode.elm as any) : undefined
        return {
            lineHeight: this.getFloatValue(style, 'line-height', 1),
            paddingTop: this.getFloatValue(style, 'padding-top', 5),
            paddingBottom: this.getFloatValue(style, 'padding-bottom', 5),
            paddingLeft: this.getFloatValue(style, 'padding-left', 5),
            paddingRight: this.getFloatValue(style, 'padding-right', 5),
            verticalAlign: this.getStringValue(style, 'vertical-align', 'middle')
        }
    }

}