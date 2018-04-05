/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SModelElementSchema, SParentElement, SChildElement, SModelFactory, SModelRootSchema, SModelRoot, getBasicType,
    ShapedPreRenderedElement, ShapedPreRenderedElementSchema, ViewportRootElement
} from "../../../src";

export class SvgFactory extends SModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new ShapedPreRenderedElement(), schema, parent);
        else
            return super.createElement(schema, parent);
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        return this.initializeRoot(new ViewportRootElement(), schema);
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is ShapedPreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered';
    }

}