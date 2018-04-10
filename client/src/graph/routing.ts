/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { center, maxDistance, Point } from "../utils/geometry";
import { SEdge } from "./sgraph";

export interface RoutedPoint extends Point {
    kind: 'source' | 'target' | 'linear'
    pointIndex?: number
}

export type EdgeRouter = (edge: SEdge) => RoutedPoint[];

const minimalPointDistance: number = 2;

export function linearRoute(edge: SEdge): RoutedPoint[] {
    const source = edge.source;
    const target = edge.target;
    if (source === undefined || target === undefined) {
        return [];
    }

    let sourceAnchor: Point;
    const rpCount = edge.routingPoints !== undefined ? edge.routingPoints.length : 0;
    if (rpCount >= 1) {
        // Use the first routing point as start anchor reference
        const p0 = edge.routingPoints[0];
        sourceAnchor = source.getTranslatedAnchor(p0, edge.parent, edge, edge.sourceAnchorCorrection);
    } else {
        // Use the target center as start anchor reference
        const reference = center(target.bounds);
        sourceAnchor = source.getTranslatedAnchor(reference, target.parent, edge, edge.sourceAnchorCorrection);
    }
    const result: RoutedPoint[] = [];
    result.push({ kind: 'source', x: sourceAnchor.x, y: sourceAnchor.y });
    let previousPoint = sourceAnchor;

    // Process all routing points except the last one
    for (let i = 0; i < rpCount - 1; i++) {
        const p = edge.routingPoints[i];
        let minDistance = minimalPointDistance;
        if (i === 0 && edge.sourceAnchorCorrection)
            minDistance += edge.sourceAnchorCorrection;
        if (maxDistance(previousPoint, p) >= minDistance) {
            result.push({ kind: 'linear', x: p.x, y: p.y, pointIndex: i });
            previousPoint = p;
        }
    }

    let targetAnchor: Point;
    if (rpCount >= 1) {
        // Use the last routing point as end anchor reference
        const pn = edge.routingPoints[rpCount - 1];
        targetAnchor = target.getTranslatedAnchor(pn, edge.parent, edge, edge.targetAnchorCorrection);
        // Add the last routing point if it's not too close to the target anchor
        const minDistance = minimalPointDistance + (edge.targetAnchorCorrection || 0);
        if (maxDistance(previousPoint, pn) >= minimalPointDistance
                && maxDistance(pn, targetAnchor) >= minDistance) {
            result.push({ kind: 'linear', x: pn.x, y: pn.y, pointIndex: rpCount - 1 });
        }
    } else {
        // Use the source center as end anchor reference
        const reference = center(source.bounds);
        targetAnchor = target.getTranslatedAnchor(reference, source.parent, edge, edge.targetAnchorCorrection);
    }
    result.push({ kind: 'target', x: targetAnchor.x, y: targetAnchor.y});
    return result;
}
