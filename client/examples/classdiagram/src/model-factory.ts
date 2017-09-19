/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SGraphFactory, SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement, SChildElement,
    getBasicType, HtmlRoot, HtmlRootSchema, PreRenderedElement, PreRenderedElementSchema
} from "../../../src"
import { ClassNode, Icon } from './model'

export class ClassDiagramFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isIconSchema(schema)) 
            return this.initializeChild(new Icon(), schema, parent)
        if (this.isNodeSchema(schema))
            return this.initializeChild(new ClassNode(), schema, parent)
        if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new PreRenderedElement(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (this.isHtmlRootSchema(schema))
            return this.initializeRoot(new HtmlRoot(), schema)
        else
            return super.createRoot(schema)
    }

    isIconSchema(schema: SModelElementSchema) {
        return getBasicType(schema) === 'icon'
    }

    isHtmlRootSchema(schema: SModelElementSchema): schema is HtmlRootSchema {
        return getBasicType(schema) === 'html'
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is PreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered'
    }
}