/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const editFeature = Symbol('editFeature')

export interface Editable extends SModelExtension {
    inEditMode: boolean
    controlPointsSet: boolean
}

export function isEditable(element: SModelElement): element is SModelElement & Editable {
    return element.hasFeature(editFeature)
}

export function hasEditFeature(element: SModelElement): boolean {
    return element.hasFeature(editFeature)
}
