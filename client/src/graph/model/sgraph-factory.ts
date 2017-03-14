import {
    SModel,
    SModelFactory,
    SModelElementSchema,
    SModelRootSchema,
    SParentElement,
    SModelRoot,
    SChildElement
} from "../../base/model"
import {SGraph, SGraphSchema, SNodeSchema, SEdgeSchema, SNode, SEdge} from "./sgraph"

export class SGraphFactory extends SModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (schema instanceof SChildElement) {
            if (parent !== undefined)
                schema.parent = parent
            return schema
        } else if (this.isNodeSchema(schema))
            return this.initializeChild(new SNode(), schema, parent)
        else if (this.isEdgeSchema(schema))
            return this.initializeChild(new SEdge(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema instanceof SModelRoot)
            return schema
        else if (this.isGraphSchema(schema))
            return this.initializeRoot(new SGraph(), schema)
        else
            return super.createRoot(schema)
    }

    isGraphSchema(schema: SModelElementSchema): schema is SGraphSchema {
        return SModel.getBasicType(schema) == 'graph'
    }

    isNodeSchema(schema: SModelElementSchema): schema is SNodeSchema {
        return SModel.getBasicType(schema) == 'node'
    }

    isEdgeSchema(schema: SModelElementSchema): schema is SEdgeSchema {
        return SModel.getBasicType(schema) == 'edge'
    }

}
