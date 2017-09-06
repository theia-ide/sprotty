/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx'
import { VNode } from "snabbdom/vnode"
import { Point, center, almostEquals } from "../utils/geometry"
import { IView, RenderingContext } from "../base/views/view"
import { AnchorableView } from "../graph/views"
import { SNode, SPort } from "../graph/sgraph"
import { ViewportRootElement } from "../features/viewport/viewport-root"
const JSX = {createElement: snabbdom.svg}

export class SvgViewportView implements IView {
    render(model: ViewportRootElement, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg>
            <g transform={transform}>
                {context.renderChildren(model)}
            </g>
        </svg>
    }
}

export class CircularNodeView extends AnchorableView {
    render(node: SNode | SPort, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g>
            <circle class-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected}
                    r={radius} cx={radius} cy={radius}></circle>
        </g>
    }

    protected getRadius(node: SNode | SPort): number {
        const d = Math.min(node.size.width, node.size.height)
        if (d > 0)
            return d / 2
        else
            return 0
    }

    getAnchor(node: SNode | SPort, refPoint: Point, anchorCorrection: number): Point {
        const radius = this.getRadius(node)
        const cx = node.position.x + radius
        const cy = node.position.y + radius
        const dx = cx - refPoint.x
        const dy = cy - refPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const normX = (dx / distance) || 0
        const normY = (dy / distance) || 0
        const strokeCorrection = 0.5 * this.getStrokeWidth(node)
        return {
            x: cx - normX * (radius + strokeCorrection + anchorCorrection),
            y: cy - normY * (radius + strokeCorrection + anchorCorrection)
        }
    }
}

export class RectangularNodeView extends AnchorableView {

    render(node: SNode | SPort, context: RenderingContext): VNode {
        return <g>
            <rect class-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={node.size.width} height={node.size.height}></rect>
        </g>
    }

    getAnchor(node: SNode | SPort, refPoint: Point, anchorCorrection: number): Point {
        const bounds = node.bounds
        const correction = 0.5 * this.getStrokeWidth(node) + anchorCorrection
        const c = center(bounds)
        const finder = new NearestPointFinder(c, refPoint)
        if (!almostEquals(c.y, refPoint.y)) {
            const xTop = this.getXIntersection(bounds.y, c, refPoint)
            if (xTop >= bounds.x && xTop <= bounds.x + bounds.width)
                finder.addCandidate(xTop, bounds.y - correction)
            const xBottom = this.getXIntersection(bounds.y + bounds.height, c, refPoint)
            if (xBottom >= bounds.x && xBottom <= bounds.x + bounds.width)
                finder.addCandidate(xBottom, bounds.y + bounds.height + correction)
        }
        if (!almostEquals(c.x, refPoint.x)) {
            const yLeft = this.getYIntersection(bounds.x, c, refPoint)
            if (yLeft >= bounds.y  && yLeft <= bounds.y + bounds.height)
                finder.addCandidate(bounds.x - correction, yLeft)
            const yRight = this.getYIntersection(bounds.x + bounds.width, c, refPoint)
            if (yRight >= bounds.y  && yRight <= bounds.y + bounds.height)
                finder.addCandidate(bounds.x + bounds.width + correction, yRight)
        }
        return finder.best
    }

    protected getXIntersection(yIntersection: number, center: Point, point: Point): number {
        const t = (yIntersection - center.y) / (point.y - center.y)
        return (point.x - center.x) * t + center.x
    }

    protected getYIntersection(xIntersection: number, center: Point, point: Point): number {
        const t = (xIntersection - center.x) / (point.x - center.x)
        return (point.y - center.y) * t + center.y
    }
}

class NearestPointFinder {
    protected currentBest: Point | undefined
    protected currentDist: number = -1

    constructor(protected center: Point, protected refPoint: Point) {}

    addCandidate(x: number, y: number) {
        const dx = this.refPoint.x - x
        const dy = this.refPoint.y - y
        const dist = dx * dx + dy * dy
        if (this.currentDist < 0 || dist < this.currentDist) {
            this.currentBest = {
                x: x,
                y: y
            }
            this.currentDist = dist
        }
    }

    get best(): Point {
        if (this.currentBest === undefined)
            return this.center
        else
            return this.currentBest
    }
}
