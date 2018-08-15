/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel";
import { SModelExtension } from "../../base/model/smodel-extension";

export const expandFeature = Symbol('expandFeature');

/**
 * Model elements that implement this interface can be expanded/collapsed
 */
export interface Expandable extends SModelExtension {
    expanded: boolean
}

export function isExpandable(element: SModelElement): element is SModelElement & Expandable {
    return element.hasFeature(expandFeature) && 'expanded' in element;
}
