import {GModelSchema, GModelElementSchema, GModelRootSchema} from "../../base/model";

export interface GGraphSchema extends GModelRootSchema {
}

export interface GNodeSchema extends GModelElementSchema {
    x: number
    y: number
    selected?: boolean
}

export interface GEdgeSchema extends GModelElementSchema {
    sourceId: string
    targetId: string
}

export namespace GGraphSchema {

    export function isGGraphSchema(schema: GModelElementSchema): schema is GGraphSchema {
        return GModelSchema.getBasicType(schema) == 'graph'
    }

    export function isGNodeSchema(schema: GModelElementSchema): schema is GNodeSchema {
        return GModelSchema.getBasicType(schema) == 'node'
    }

    export function isGEdgeSchema(schema: GModelElementSchema): schema is GEdgeSchema {
        return GModelSchema.getBasicType(schema) == 'edge'
    }

}
