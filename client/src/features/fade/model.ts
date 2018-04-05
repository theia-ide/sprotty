/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel";
import { SModelExtension } from "../../base/model/smodel-extension";

export const fadeFeature = Symbol('fadeFeature');

export interface Fadeable extends SModelExtension {
    opacity: number
}

export function isFadeable(element: SModelElement): element is SModelElement & Fadeable {
    return element.hasFeature(fadeFeature) && (element as any)['opacity'] !== undefined;
}
