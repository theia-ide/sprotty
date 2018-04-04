/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx'
import { VNode } from "snabbdom/vnode"
import { Point, centerOfLine, maxDistance } from '../utils/geometry'
import { setAttr } from '../base/views/vnode-utils'
import { RenderingContext, IView } from "../base/views/view"
import { SModelElement, SParentElement } from "../base/model/smodel"
import { getSubType, translatePoint } from "../base/model/smodel-utils"
import { SRoutingHandle, isRoutable } from '../features/edit/model'
import { SCompartment, SEdge, SGraph, SLabel, SNode, SPort } from "./sgraph"
import { IAnchorableView, LinearRouter, RoutedPoint } from './routing'

const JSX = {createElement: snabbdom.svg}

/**
 * IView component that turns an SGraph element and its children into a tree of virtual DOM elements.
 */
export class SGraphView implements IView {

    render(model: SGraph, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg class-sprotty-graph={true}>
            <g transform={transform}>
                {context.renderChildren(model)}
            </g>
        </svg>
    }
}

export abstract class AnchorableView implements IView, IAnchorableView {
    abstract render(model: SModelElement, context: RenderingContext): VNode

    abstract getAnchor(model: SNode | SPort, refPoint: Point, anchorCorrection: number): Point

    getStrokeWidth(model: SNode | SPort): number {
        return 0
    }

    getTranslatedAnchor(node: SNode | SPort, refPoint: Point, refContainer: SParentElement,
            anchorCorrection: number = 0, edge: SEdge): Point {
        const viewContainer = node.parent
        const anchor = this.getAnchor(node, translatePoint(refPoint, refContainer, viewContainer), anchorCorrection)
        const edgeContainer = edge.parent
        return translatePoint(anchor, viewContainer, edgeContainer)
    }
}

export class PolylineEdgeView implements IView {
    router = new LinearRouter() // TODO get via dependency injection

    render(edge: SEdge, context: RenderingContext): VNode {
        const source = edge.source
        if (source === undefined)
            return this.renderDanglingEdge("Cannot resolve source", edge, context)

        const target = edge.target
        if (target === undefined)
            return this.renderDanglingEdge("Cannot resolve target", edge, context)

        const sourceView = context.viewRegistry.get(source.type, source)
        if (!(sourceView instanceof AnchorableView))
            return this.renderDanglingEdge("Expected source view type: AnchorableView", edge, context)

        const targetView = context.viewRegistry.get(target.type, target)
        if (!(targetView instanceof AnchorableView))
            return this.renderDanglingEdge("Expected target view type: AnchorableView", edge, context)

        const route = this.router.route(edge, source, sourceView, target, targetView)

        return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context)}
            {this.renderAdditionals(edge, route, context)}
            {context.renderChildren(edge, { route })}
        </g>
    }

    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0]
        let path = `M ${firstPoint.x},${firstPoint.y}`
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i]
            path += ` L ${p.x},${p.y}`
        }
        return <path d={path}/>
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        return []
    }

    protected renderDanglingEdge(message: string, edge: SEdge, context: RenderingContext): VNode {
        return <text class-sprotty-edge-dangling={true} title={message}>?</text>
    }
}

export class SRoutingHandleView implements IView {
    minimalPointDistance: number = 10

    render(handle: SRoutingHandle, context: RenderingContext, args?: { route?: RoutedPoint[] }): VNode {
        if (args && args.route) {
            const position = this.getPosition(handle, args.route)
            handle.viewPosition = position
            if (position !== undefined) {
                const node = <circle class-sprotty-routing-handle={true}
                        class-selected={handle.selected} class-mouseover={handle.hoverFeedback}
                        cx={position.x} cy={position.y}/>   // Radius must be specified via CSS
                setAttr(node, 'data-kind', handle.kind)
                return node
            }
        }
        // Fallback: Create an empty group
        handle.viewPosition = undefined
        return <g/>
    }

    protected getPosition(handle: SRoutingHandle, route: RoutedPoint[]): Point | undefined {
        if (handle.kind === 'line') {
            const parent = handle.parent
            if (isRoutable(parent)) {
                const getIndex = (rp: RoutedPoint) => {
                    if (rp.pointIndex !== undefined)
                        return rp.pointIndex
                    else if (rp.kind === 'target')
                        return parent.routingPoints.length
                    else
                        return -1
                }
                let rp1, rp2: RoutedPoint | undefined
                for (const rp of route) {
                    const i = getIndex(rp)
                    if (i <= handle.pointIndex && (rp1 === undefined || i > getIndex(rp1)))
                        rp1 = rp
                    if (i > handle.pointIndex && (rp2 === undefined || i < getIndex(rp2)))
                        rp2 = rp
                }
                if (rp1 !== undefined && rp2 !== undefined) {
                    // Skip this handle if its related line segment is not included in the route
                    if (getIndex(rp1) !== handle.pointIndex && handle.pointIndex >= 0) {
                        const point = parent.routingPoints[handle.pointIndex]
                        if (maxDistance(point, rp1) >= maxDistance(point, rp2))
                            return undefined
                    }
                    if (getIndex(rp2) !== handle.pointIndex + 1 && handle.pointIndex + 1 < parent.routingPoints.length) {
                        const point = parent.routingPoints[handle.pointIndex + 1]
                        if (maxDistance(point, rp1) < maxDistance(point, rp2))
                            return undefined
                    }
                    // Skip this handle if its related line segment is too short
                    if (maxDistance(rp1, rp2) >= this.minimalPointDistance)
                        return centerOfLine(rp1, rp2)
                }
            }
        } else {
            return route.find(rp => rp.pointIndex === handle.pointIndex)
        }
        return undefined
    }
}

export class SLabelView implements IView {
    render(label: SLabel, context: RenderingContext): VNode {
        const vnode = <text class-sprotty-label={true}>{label.text}</text>
        const subType = getSubType(label)
        if (subType)
            setAttr(vnode, 'class', subType)
        return vnode
    }
}

export class SCompartmentView implements IView {
    render(model: SCompartment, context: RenderingContext): VNode {
        const translate = `translate(${model.bounds.x}, ${model.bounds.y})`
        const vnode = <g transform={translate} class-sprotty-comp="{true}">
            {context.renderChildren(model)}
        </g>
        const subType = getSubType(model)
        if (subType)
            setAttr(vnode, 'class', subType)
        return vnode
    }
}
