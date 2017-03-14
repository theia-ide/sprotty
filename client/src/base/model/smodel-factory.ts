import {SGraph, SGraphSchema} from "../../graph/model"
import {SModelRootSchema} from "./smodel-schema"
import {SModelRoot} from "./smodel"

export namespace SModelFactory {

    export function createModel(schema: SModelRootSchema): SModelRoot {
        if (SGraphSchema.isGGraphSchema(schema))
            return new SGraph(schema)
        else
            return new SModelRoot(schema)
    }

}
