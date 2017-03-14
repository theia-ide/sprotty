import {SModelSchema, SModelElementSchema, SModelRootSchema} from "../../base/model"

export interface SGraphSchema extends SModelRootSchema {
}

export interface SNodeSchema extends SModelElementSchema {
    x: number
    y: number
    selected?: boolean
}

export interface SEdgeSchema extends SModelElementSchema {
    sourceId: string
    targetId: string
}

export namespace SGraphSchema {

    export function isGGraphSchema(schema: SModelElementSchema): schema is SGraphSchema {
        return SModelSchema.getBasicType(schema) == 'graph'
    }

    export function isGNodeSchema(schema: SModelElementSchema): schema is SNodeSchema {
        return SModelSchema.getBasicType(schema) == 'node'
    }

    export function isGEdgeSchema(schema: SModelElementSchema): schema is SEdgeSchema {
        return SModelSchema.getBasicType(schema) == 'edge'
    }

}
