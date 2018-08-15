/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement, SModelRoot } from "../../base/model/smodel";
import { Scrollable } from "./scroll";
import { Zoomable } from "./zoom";

export const viewportFeature = Symbol('viewportFeature');

export interface Viewport extends Scrollable, Zoomable {
}

export function isViewport(element: SModelElement): element is SModelRoot & Viewport {
    return element instanceof SModelRoot
        && element.hasFeature(viewportFeature)
        && 'zoom' in element
        && 'scroll' in element;
}
