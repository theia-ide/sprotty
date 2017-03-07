export interface GGraphSchema {
    id: string
    type: string
    shapes: GShapeSchema[]
}

export interface GNodeSchema {
    id: string;
    type: string;
    selected?: boolean
    x: number
    y: number
}

export interface GEdgeSchema {
    id: string;
    type: string;
    sourceId: string
    targetId: string
}

export type GShapeSchema = GNodeSchema | GEdgeSchema

export function isGNodeSchema(schema: GShapeSchema): schema is GNodeSchema {
    return 'x' in schema
}