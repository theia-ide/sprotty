/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { center, maxDistance, Point } from "../utils/geometry"
import { SParentElement } from "../base/model/smodel"
import { SEdge, SNode, SPort } from "./sgraph"

export interface IEdgeRouter {
    route(edge: SEdge, source: SNode | SPort, sourceView: IAnchorableView,
            target: SNode | SPort, targetView: IAnchorableView): RoutedPoint[]
}

export interface IAnchorableView {
    getAnchor(model: SNode | SPort, refPoint: Point, anchorCorrection: number): Point

    getTranslatedAnchor(node: SNode | SPort, refPoint: Point, refContainer: SParentElement,
        anchorCorrection: number, edge: SEdge): Point

    getStrokeWidth(model: SNode | SPort): number
}

export interface RoutedPoint extends Point {
    kind: 'source' | 'target' | 'linear'
    pointIndex?: number
}

export class LinearRouter implements IEdgeRouter {
    minimalPointDistance: number = 2

    route(edge: SEdge, source: SNode | SPort, sourceView: IAnchorableView,
            target: SNode | SPort, targetView: IAnchorableView): RoutedPoint[] {
        let sourceAnchor: Point
        const rpCount = edge.routingPoints !== undefined ? edge.routingPoints.length : 0
        if (rpCount >= 1) {
            // Use the first routing point as start anchor reference
            let p0 = edge.routingPoints[0]
            sourceAnchor = sourceView.getTranslatedAnchor(source, p0, edge.parent, this.getSourceAnchorCorrection(edge), edge)
        } else {
            // Use the target center as start anchor reference
            const reference = center(target.bounds)
            sourceAnchor = sourceView.getTranslatedAnchor(source, reference, target.parent, this.getSourceAnchorCorrection(edge), edge)
        }
        const result: RoutedPoint[] = []
        result.push({ kind: 'source', x: sourceAnchor.x, y: sourceAnchor.y })
        let previousPoint = sourceAnchor

        // Process all routing points except the last one
        for (let i = 0; i < rpCount - 1; i++) {
            const p = edge.routingPoints[i]
            let minDistance = this.minimalPointDistance
            if (i === 0)
                minDistance += this.getSourceAnchorCorrection(edge) + sourceView.getStrokeWidth(source)
            if (maxDistance(previousPoint, p) >= minDistance) {
                result.push({ kind: 'linear', x: p.x, y: p.y, pointIndex: i })
                previousPoint = p
            }
        }

        let targetAnchor: Point
        if (rpCount >= 1) {
            // Use the last routing point as end anchor reference
            let pn = edge.routingPoints[rpCount - 1]
            targetAnchor = targetView.getTranslatedAnchor(target, pn, edge.parent, this.getTargetAnchorCorrection(edge), edge)
            // Add the last routing point if it's not too close to the target anchor
            const minDistance = this.minimalPointDistance + this.getTargetAnchorCorrection(edge) + targetView.getStrokeWidth(source)
            if (maxDistance(previousPoint, pn) >= this.minimalPointDistance
                    && maxDistance(pn, targetAnchor) >= minDistance) {
                result.push({ kind: 'linear', x: pn.x, y: pn.y, pointIndex: rpCount - 1 })
            }
        } else {
            // Use the source center as end anchor reference
            const reference = center(source.bounds)
            targetAnchor = targetView.getTranslatedAnchor(target, reference, source.parent, this.getTargetAnchorCorrection(edge), edge)
        }
        result.push({ kind: 'target', x: targetAnchor.x, y: targetAnchor.y})
        return result
    }

    protected getSourceAnchorCorrection(edge: SEdge): number {
        return 0
    }

    protected getTargetAnchorCorrection(edge: SEdge): number {
        return 0
    }
}
