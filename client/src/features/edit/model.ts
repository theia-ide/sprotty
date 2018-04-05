/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Point } from '../../utils/geometry';
import { SModelElement, SChildElement } from '../../base/model/smodel';
import { SModelExtension } from '../../base/model/smodel-extension';
import { Selectable, selectFeature } from '../select/model';
import { moveFeature } from '../move/model';
import { Hoverable, hoverFeedbackFeature } from '../hover/model';

export const editFeature = Symbol('editFeature');

export interface Routable extends SModelExtension {
    routingPoints: Point[]
    readonly source?: SModelElement
    readonly target?: SModelElement
}

export function isRoutable(element: SModelElement): element is SModelElement & Routable {
    return (element as any)['routingPoints'] !== undefined;
}

export function canEditRouting(element: SModelElement): element is SModelElement & Routable {
    return isRoutable(element) && element.hasFeature(editFeature);
}

export class SRoutingHandle extends SChildElement implements Selectable, Hoverable {
    /** 'junction' is a point where two line segments meet, 'line' is a volatile handle placed on a line segment. */
    kind: 'junction' | 'line';
    /** The actual routing point index (junction) or the previous point index (line). */
    pointIndex: number;
    /**
     * The position computed by the view of this handle during rendering.
     * TODO find a better solution
     */
    viewPosition?: Point;

    hoverFeedback: boolean = false;
    selected: boolean = false;

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === moveFeature || feature === hoverFeedbackFeature;
    }
}
