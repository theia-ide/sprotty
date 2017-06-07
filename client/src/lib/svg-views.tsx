/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx'
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from "../base/view/views"
import { SNodeView } from "../graph/view/views"
import { SNode } from "../graph/model/sgraph"
import { Point } from "../utils/geometry"
import { ViewportRootElement } from "../features/viewport/viewport-root"

const JSX = {createElement: snabbdom.svg}

export class SvgViewportView implements IView {
    render(model: ViewportRootElement, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg key={model.id} id={context.createUniqueDOMElementId(model)}>
            <g transform={transform}>
                {context.renderChildren(model)}
            </g>
        </svg>
    }
}

export class CircularNodeView extends SNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g key={node.id} id={context.createUniqueDOMElementId(node)} >
            <circle class-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected}
                    r={radius} cx={radius} cy={radius}></circle>
        </g>
    }

    protected getRadius(node: SNode): number {
        const d = Math.min(node.size.width, node.size.height)
        if (d > 0)
            return d / 2
        else
            return 0
    }

    getAnchor(node: SNode, refPoint: Point) {
        const radius = this.getRadius(node)
        const cx = node.position.x + radius
        const cy = node.position.y + radius
        const dx = cx - refPoint.x
        const dy = cy - refPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const normX = (dx / distance) || 0
        const normY = (dy / distance) || 0
        return {
            x: cx - normX * radius,
            y: cy - normY * radius
        }
    }
}

export class RectangularNodeView extends SNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return <g key={node.id} id={context.createUniqueDOMElementId(node)} >
            <rect class-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={node.size.width} height={node.size.height}></rect>
        </g>
    }

    getAnchor(node: SNode, refPoint: Point) {
        const bounds = node.bounds
        let x = refPoint.x
        if (x < bounds.x)
            x = bounds.x
        else if (x > bounds.x + bounds.width)
            x = bounds.x + bounds.width
        let y = refPoint.y
        if (y < bounds.y)
            y = bounds.y
        else if (y > bounds.y + bounds.height)
            y = bounds.y + bounds.height
        return { x, y }
    }
}
