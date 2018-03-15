/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx'
import { VNode } from "snabbdom/vnode"
import { center, maxDistance, Point } from "../utils/geometry"
import { setAttr } from '../base/views/vnode-utils'
import { RenderingContext, IView } from "../base/views/view"
import { SModelElement, SParentElement } from "../base/model/smodel"
import { getSubType, translatePoint } from "../base/model/smodel-utils"
import { SCompartment, SRoutingPoint, SEdge, SGraph, SLabel, SNode, SPort } from "./sgraph"

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

export abstract class AnchorableView implements IView {
    abstract render(model: SModelElement, context: RenderingContext): VNode

    abstract getAnchor(model: SNode | SPort, refPoint: Point, anchorCorrection: number): Point

    getStrokeWidth(model: SNode | SPort): number {
        return 0
    }

    getTranslatedAnchor(node: SNode | SPort, refPoint: Point, refContainer: SParentElement, anchorCorrection: number = 0, edge: SEdge): Point {
        const viewContainer = node.parent
        const anchor = this.getAnchor(node, translatePoint(refPoint, refContainer, viewContainer), anchorCorrection)
        const edgeContainer = edge.parent
        return translatePoint(anchor, viewContainer, edgeContainer)
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

        return <g class-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, segments, context)}
            {this.renderAdditionals(edge, segments, context)}
            {context.renderChildren(edge)}
        </g>
    }

    protected findPosition(p: SRoutingPoint | Point): Point {
        if (p instanceof SRoutingPoint) {
            return p.position
        } else {
            return p
        }
    }

    protected computeSegments(edge: SEdge, source: SNode | SPort, sourceView: AnchorableView,
                              target: SNode | SPort, targetView: AnchorableView): Point[] {
        let sourceAnchor: Point
        if (edge.routingPoints !== undefined && edge.routingPoints.length >= 1) {
            // Use the first routing point as start anchor reference
            let p0 = edge.routingPoints[0]
            sourceAnchor = sourceView.getTranslatedAnchor(source, p0, edge.parent, this.getSourceAnchorCorrection(edge), edge)
        } else {
            // Use the target center as start anchor reference
            const reference = center(target.bounds)
            sourceAnchor = sourceView.getTranslatedAnchor(source, reference, target.parent, this.getSourceAnchorCorrection(edge), edge)
        }
        const result: Point[] = [sourceAnchor]
        let previousPoint = sourceAnchor
        edge.anchors.sourceAnchor = sourceAnchor

        for (let i = 0; i < edge.routingPoints.length; i++) {
            const p = edge.routingPoints[i]
            const minDistance = this.minimalPointDistance + ((i === 0)
                ? this.getSourceAnchorCorrection(edge) + sourceView.getStrokeWidth(source)
                : 0)
            if (maxDistance(previousPoint, p) >= minDistance) {
                result.push(p)
                previousPoint = p
            }
        }

        let targetAnchor: Point
        if (edge.routingPoints && edge.routingPoints.length >= 1) {
            // Use the last routing point as end anchor reference
            let pn = edge.routingPoints[edge.routingPoints.length - 1]
            targetAnchor = targetView.getTranslatedAnchor(target, pn, edge.parent, this.getTargetAnchorCorrection(edge), edge)
            const minDistance = this.minimalPointDistance + this.getTargetAnchorCorrection(edge) + targetView.getStrokeWidth(source)
            if (maxDistance(previousPoint, pn) >= this.minimalPointDistance
                    && maxDistance(pn, targetAnchor) >= minDistance) {
                result.push(pn)
            }
        } else {
            // Use the source center as end anchor reference
            const reference = center(source.bounds)
            targetAnchor = targetView.getTranslatedAnchor(target, reference, source.parent, this.getTargetAnchorCorrection(edge), edge)
        }
        return result
    }

    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0]
        let path = `M ${firstPoint.x},${firstPoint.y}`
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i]
            path += ` L ${p.x},${p.y}`
        }
        return <path class-sprotty-edge={true} d={path}/>
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        return context.renderChildren(edge)
    }

    protected renderDanglingEdge(message: string, edge: SEdge, context: RenderingContext): VNode {
        return <text class-sprotty-edge-dangling={true} title={message}>?</text>
    }

    protected getSourceAnchorCorrection(edge: SEdge): number {
        return 0
    }

    protected getTargetAnchorCorrection(edge: SEdge): number {
        return 0
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
