import { SModelElementSchema, SParentElement, SChildElement, SModel } from "../../../src/base"
import { SGraphFactory } from "../../../src/graph"
import { ExecutionNode, BarrierNode, ExecutionNodeSchema, BarrierNodeSchema } from "./flowmodel"

export class FlowModelFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (schema instanceof SChildElement) {
            if (parent !== undefined)
                schema.parent = parent
            return schema
        } else if (this.isExecutionNodeSchema(schema))
            return this.initializeChild(new ExecutionNode(), schema, parent)
        else if (this.isBarrierNodeSchema(schema))
            return this.initializeChild(new BarrierNode(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    isExecutionNodeSchema(schema: SModelElementSchema): schema is ExecutionNodeSchema {
        return SModel.getBasicType(schema) == 'execution'
    }

    isBarrierNodeSchema(schema: SModelElementSchema): schema is BarrierNodeSchema {
        return SModel.getBasicType(schema) == 'barrier'
    }
}
