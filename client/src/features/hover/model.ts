/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel";
import { SModelExtension } from "../../base/model/smodel-extension";

export const hoverFeedbackFeature = Symbol('hoverFeedbackFeature');

export interface Hoverable extends SModelExtension {
    hoverFeedback: boolean
}

export function isHoverable(element: SModelElement): element is SModelElement & Hoverable {
    return element.hasFeature(hoverFeedbackFeature);
}

export const popupFeature = Symbol('popupFeature');

export function hasPopupFeature(element: SModelElement): boolean {
    return element.hasFeature(popupFeature);
}
