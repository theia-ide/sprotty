/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from "snabbdom-jsx"
import { VNode } from "snabbdom/vnode"
import { center, manhattanDistance, Point } from "../utils/geometry"
import { setAttr } from '../base/views/vnode-utils'
import { RenderingContext, IView } from "../base/views/view"
import { SModelElement, SChildElement } from "../base/model/smodel"
import { getSubType, translatePoint } from "../base/model/smodel-utils"
import { SCompartment, SEdge, SGraph, SLabel, SNode, SPort } from "./sgraph"

const JSX = {createElement: snabbdom.svg}

/**
 * IView component that turns an SGraph element and its children into a tree of virtual DOM elements.
 */
export class SGraphView implements IView {

    render(model: SGraph, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg class-graph={true}>
            <g transform={transform}>
                {context.renderChildren(model)}
            </g>
        </svg>
    }
}

export abstract class AnchorableView implements IView {
    abstract render(model: SModelElement, context: RenderingContext): VNode

    abstract getAnchor(model: SNode | SPort, refPoint: Point): Point

    getTranslatedAnchor(viewModel: SNode | SPort, refPoint: Point, refModel: SChildElement, targetModel?: SChildElement): Point {
        const refContainer = refModel.parent
        const viewContainer = viewModel.parent
        const anchor = this.getAnchor(viewModel, translatePoint(refPoint, refContainer, viewContainer))
        const targetContainer = targetModel !== undefined ? targetModel.parent : refContainer
        return translatePoint(anchor, viewContainer, targetContainer)
    }
}

export class PolylineEdgeView implements IView {
    minimalPointDistance: number = 2

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

        const segments = this.computeSegments(edge, source, sourceView, target, targetView)

        return <g>
            {this.renderLine(edge, segments, context)}
            {this.renderAdditionals(edge, segments, context)}
            {context.renderChildren(edge)}
        </g>
    }

    protected computeSegments(edge: SEdge, source: SNode | SPort, sourceView: AnchorableView,
                              target: SNode | SPort, targetView: AnchorableView): Point[] {
        let sourceAnchor: Point
        if (edge.routingPoints !== undefined && edge.routingPoints.length >= 1) {
            // Use the first routing point as start anchor reference
            let p0 = edge.routingPoints[0]
            sourceAnchor = sourceView.getTranslatedAnchor(source, p0, edge)
        } else {
            // Use the target center as start anchor reference
            const reference = center(target.bounds)
            sourceAnchor = sourceView.getTranslatedAnchor(source, reference, target, edge)
        }
        const result: Point[] = [sourceAnchor]
        let previousPoint = sourceAnchor

        for (let i = 0; i < edge.routingPoints.length - 1; i++) {
            const p = edge.routingPoints[i]
            if (manhattanDistance(previousPoint, p) >= this.minimalPointDistance) {
                result.push(p)
                previousPoint = p
            }
        }

        let targetAnchor: Point
        if (edge.routingPoints && edge.routingPoints.length >= 2) {
            // Use the last routing point as end anchor reference
            let pn = edge.routingPoints[edge.routingPoints.length - 1]
            targetAnchor = targetView.getTranslatedAnchor(target, pn, edge)
            if (manhattanDistance(previousPoint, pn) >= this.minimalPointDistance
                    && manhattanDistance(pn, targetAnchor) >= this.minimalPointDistance) {
                result.push(pn)
            }
        } else {
            // Use the source center as end anchor reference
            const reference = center(source.bounds)
            targetAnchor = targetView.getTranslatedAnchor(target, reference, source, edge)
        }
        result.push(targetAnchor)
        return result
    }

    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0]
        let path = `M ${firstPoint.x},${firstPoint.y}`
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i]
            path += ` L ${p.x},${p.y}`
        }
        return <path class-edge={true} d={path}/>
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        return []
    }

    protected renderDanglingEdge(message: string, edge: SEdge, context: RenderingContext): VNode {
        return <text class-dangling-edge={true} title={message}>?</text>
    }
}

export class SLabelView implements IView {
    render(label: SLabel, context: RenderingContext): VNode {
        const vnode = <text class-label={true}>{label.text}</text>
        setAttr(vnode, 'class', getSubType(label))
        return vnode
    }
}

export class SCompartmentView implements IView {
    render(model: SCompartment, context: RenderingContext): VNode {
        const translate = `translate(${model.bounds.x}, ${model.bounds.y})`
        const vnode = <g transform={translate} class-comp="{true}">
            {context.renderChildren(model)}
        </g>
        setAttr(vnode, 'class', getSubType(model))
        return vnode
    }
}
