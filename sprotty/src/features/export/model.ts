/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from '../../base/model/smodel';
import { SModelExtension } from '../../base/model/smodel-extension';

export const exportFeature = Symbol('exportFeature');

export interface Exportable extends SModelExtension {
    export: boolean
}

export function isExportable(element: SModelElement): element is SModelElement & Exportable {
     return element.hasFeature(exportFeature) && (element as any)['export'] !== undefined;
}
