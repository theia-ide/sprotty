/*
 * Copyright (C) 2018 EclipseSource and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel";
import { SModelExtension } from "../../base/model/smodel-extension";

export const rotationFeature = Symbol('rotationFeature');

/**
 * An element that can be rotated.
 */
export interface Rotatable extends SModelExtension {
    rotationInDegrees: number
}

export function isRotated(element: SModelElement): element is SModelElement  {
    return element.hasFeature(rotationFeature) && (element as any)['rotationInDegrees'] !== undefined;
}
