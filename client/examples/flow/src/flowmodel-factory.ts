import {
    SModelElementSchema, SParentElement, SChildElement, getBasicType, SModelRootSchema, SModelRoot
} from "../../../src/base"
import { SGraphFactory, SGraphSchema, SGraph } from "../../../src/graph"
import {
    TaskNode, BarrierNode, TaskNodeSchema, BarrierNodeSchema
} from "./flowmodel"

export class FlowModelFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (schema instanceof SChildElement) {
            if (parent !== undefined)
                schema.parent = parent
            return schema
        } else if (this.isTaskNodeSchema(schema))
            return this.initializeChild(new TaskNode(), schema, parent)
        else if (this.isBarrierNodeSchema(schema))
            return this.initializeChild(new BarrierNode(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema instanceof SModelRoot)
            return schema
        else if (this.isFlowSchema(schema))
            return this.initializeRoot(new SGraph(), schema)
        else
            return super.createRoot(schema)
    }

    isFlowSchema(schema: SModelRootSchema): schema is SGraphSchema {
        return getBasicType(schema) == 'flow'
    }

    isTaskNodeSchema(schema: SModelElementSchema): schema is TaskNodeSchema {
        return getBasicType(schema) == 'task'
    }

    isBarrierNodeSchema(schema: SModelElementSchema): schema is BarrierNodeSchema {
        return getBasicType(schema) == 'barrier'
    }
}
