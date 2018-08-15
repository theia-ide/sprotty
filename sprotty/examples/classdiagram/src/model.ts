/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SShapeElement, Expandable, boundsFeature, expandFeature, fadeFeature, layoutContainerFeature, layoutableChildFeature, RectangularNode
} from "../../../src";

export class ClassNode extends RectangularNode implements Expandable {
    expanded: boolean = false;

    hasFeature(feature: symbol) {
        return feature === expandFeature || super.hasFeature(feature);
    }
}

export class Icon extends SShapeElement {
    size = {
        width: 32,
        height: 32
    };

    hasFeature(feature: symbol): boolean {
        return feature === boundsFeature || feature === layoutContainerFeature || feature === layoutableChildFeature || feature === fadeFeature;
    }
}