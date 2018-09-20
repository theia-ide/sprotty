/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Point, angleBetweenPoints } from '../../utils/geometry';
import { SModelElement, SChildElement, SParentElement } from '../../base/model/smodel';
import { SModelExtension } from '../../base/model/smodel-extension';
import { Selectable, selectFeature } from '../select/model';
import { moveFeature } from '../move/model';
import { Hoverable, hoverFeedbackFeature } from '../hover/model';
import { RoutedPoint } from '../../graph/routing';

export const editFeature = Symbol('editFeature');

export interface Routable extends SModelExtension {
    routingPoints: Point[]
    readonly source?: SModelElement
    readonly target?: SModelElement
    route(): RoutedPoint[]
}

export function isRoutable(element: SModelElement): element is SModelElement & Routable {
    return (element as any).routingPoints !== undefined && typeof((element as any).route) === 'function';
}

export function canEditRouting(element: SModelElement): element is SModelElement & Routable {
    return isRoutable(element) && element.hasFeature(editFeature);
}

export class SRoutingHandle extends SChildElement implements Selectable, Hoverable {
    /** 'junction' is a point where two line segments meet, 'line' is a volatile handle placed on a line segment. */
    kind: 'junction' | 'line';
    /** The actual routing point index (junction) or the previous point index (line). */
    pointIndex: number;
    /** Whether the routing point is being dragged. */
    editMode: boolean = false;

    hoverFeedback: boolean = false;
    selected: boolean = false;

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === moveFeature || feature === hoverFeedbackFeature;
    }
}

/** The angle in radians below which a routing handle is removed. */
const HANDLE_REMOVE_THRESHOLD = 0.1;

/**
 * Remove routed points that are in edit mode and for which the angle between the preceding and
 * following points falls below a threshold.
 */
export function filterEditModeHandles(route: RoutedPoint[], parent: SParentElement): RoutedPoint[] {
    if (parent.children.length === 0)
        return route;

    let i = 0;
    while (i < route.length) {
        const curr = route[i];
        if (curr.pointIndex !== undefined) {
            const handle: SRoutingHandle | undefined = parent.children.find(child =>
                child instanceof SRoutingHandle && child.kind === 'junction' && child.pointIndex === curr.pointIndex) as any;
            if (handle !== undefined && handle.editMode && i > 0 && i < route.length - 1) {
                const prev = route[i - 1], next = route[i + 1];
                const prevDiff: Point = { x: prev.x - curr.x, y: prev.y - curr.y };
                const nextDiff: Point = { x: next.x - curr.x, y: next.y - curr.y };
                const angle = angleBetweenPoints(prevDiff, nextDiff);
                if (Math.abs(Math.PI - angle) < HANDLE_REMOVE_THRESHOLD) {
                    route.splice(i, 1);
                    continue;
                }
            }
        }
        i++;
    }
    return route;
}
