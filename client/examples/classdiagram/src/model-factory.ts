import { SGraphFactory } from "../../../src/graph/model/sgraph-factory"
import { getBasicType, SModelElementSchema, SModelRoot, SModelRootSchema } from "../../../src/base/model/smodel"
import { SGraph, SGraphSchema } from "../../../src/graph/model/sgraph"
import { TextRoot, TextRootSchema } from "../../../src/lib/model"

export class ClassDiagramFactory extends SGraphFactory {
    createRoot(schema: SModelRootSchema): SModelRoot {
        if (this.isTextSchema(schema))
            return this.initializeRoot(new TextRoot(), schema)
        else
            return super.createRoot(schema)
    }

    isTextSchema(schema: SModelElementSchema): schema is TextRootSchema {
        return getBasicType(schema) == 'text'
    }

}