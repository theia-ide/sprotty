/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SGraphFactory, SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement, SChildElement,
    getBasicType, PreRenderedElement, PreRenderedElementSchema
} from "../../../src"
import { PopupButton, Mindmap } from "./model"

export class MindmapFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new PreRenderedElement(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema.type === 'mindmap')
            return this.initializeRoot(new Mindmap(), schema)
        else if (schema.type === 'popup:button')
            return this.initializeRoot(new PopupButton(), schema)
        else
            return super.createRoot(schema)
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is PreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered'
    }
}