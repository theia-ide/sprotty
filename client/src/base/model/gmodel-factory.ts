import {GGraph, GGraphSchema} from "../../graph/model"
import {GModelRootSchema} from "./gmodel-schema"
import {GModelRoot} from "./gmodel"

export namespace GModelFactory {

    export function createModel(schema: GModelRootSchema): GModelRoot {
        if (GGraphSchema.isGGraphSchema(schema))
            return new GGraph(schema)
        else
            return new GModelRoot(schema)
    }

}
