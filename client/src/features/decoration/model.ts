/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelExtension } from "../../base/model/smodel-extension";
import { hoverFeedbackFeature, popupFeature } from "../hover/model";
import { SModelElement } from "../../base/model/smodel";
import { SShapeElement, boundsFeature } from "../bounds/model";

export const decorationFeature = Symbol('decorationFeature');

export interface Decoration extends SModelExtension {
}

export function isDecoration<T extends SModelElement>(e: T): e is T & Decoration {
    return e.hasFeature(decorationFeature);
}

export class SDecoration extends SShapeElement implements Decoration {
    hasFeature(feature: symbol) {
        return feature === decorationFeature
            || feature === boundsFeature
            || feature === hoverFeedbackFeature
            || feature === popupFeature
            || super.hasFeature(feature);
    }
}

export type SIssueSeverity = 'error' | 'warning' | 'info';

export class SIssueMarker extends SDecoration {
    messages: string[];
    severity: SIssueSeverity;
}

