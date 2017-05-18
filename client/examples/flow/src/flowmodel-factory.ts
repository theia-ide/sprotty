/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SChildElement, SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement, getBasicType
} from "../../../src/base"
import { SGraph, SGraphFactory, SGraphSchema } from "../../../src/graph"
import { BarrierNode, BarrierNodeSchema, TaskNode, TaskNodeSchema } from "./flowmodel"
import { HtmlRootSchema, PreRenderedElementSchema, PreRenderedElement, HtmlRoot } from "../../../src/lib"

export class FlowModelFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isTaskNodeSchema(schema))
            return this.initializeChild(new TaskNode(), schema, parent)
        else if (this.isBarrierNodeSchema(schema))
            return this.initializeChild(new BarrierNode(), schema, parent)
        else if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new PreRenderedElement(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (this.isFlowSchema(schema))
            return this.initializeRoot(new SGraph(), schema)
        else if (this.isHtmlRootSchema(schema))
            return this.initializeRoot(new HtmlRoot(), schema)
        else
            return super.createRoot(schema)
    }

    isFlowSchema(schema: SModelRootSchema): schema is SGraphSchema {
        return getBasicType(schema) === 'flow'
    }

    isTaskNodeSchema(schema: SModelElementSchema): schema is TaskNodeSchema {
        return getBasicType(schema) === 'task'
    }

    isBarrierNodeSchema(schema: SModelElementSchema): schema is BarrierNodeSchema {
        return getBasicType(schema) === 'barrier'
    }

    isHtmlRootSchema(schema: SModelElementSchema): schema is HtmlRootSchema {
        return getBasicType(schema) === 'html'
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is PreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered'
    }
}
