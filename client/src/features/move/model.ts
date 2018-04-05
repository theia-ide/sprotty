/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Point } from "../../utils/geometry";
import { SModelElement } from "../../base/model/smodel";
import { SModelExtension } from "../../base/model/smodel-extension";

export const moveFeature = Symbol('moveFeature');

/**
 * An element that can be placed at a specific location using its position
 * property.
 */
export interface Locateable extends SModelExtension {
    position: Point
}

export function isLocateable(element: SModelElement): element is SModelElement & Locateable {
    return (element as any)['position'] !== undefined;
}

export function isMoveable(element: SModelElement): element is SModelElement & Locateable {
    return element.hasFeature(moveFeature) && isLocateable(element);
}
