/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { boundsFeature, layoutableChildFeature, SShapeElement, SShapeElementSchema } from '../bounds/model';
import { fadeFeature } from '../fade/model';

export interface SButtonSchema extends SShapeElementSchema {
    pressed: boolean
    enabled: boolean
}

export class SButton extends SShapeElement {
    enabled = true;

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === fadeFeature || feature === layoutableChildFeature;
    }
}
