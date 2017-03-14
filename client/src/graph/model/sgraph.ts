import {
    SModelRootSchema, SModelElementSchema, SParentElementSchema, SChildElement, SModelRoot, Moveable, Selectable
} from "../../base/model"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
}

export class SGraph extends SModelRoot implements SGraphSchema {
    children: SGraphElement[]
}

export interface SNodeSchema extends SParentElementSchema, Moveable {
    x: number
    y: number
    children?: SGraphElementSchema[]
}

export class SNode extends SChildElement implements SNodeSchema, Selectable {
    x: number
    y: number
    selected: boolean = false
    children: SGraphElement[]
}

export interface SEdgeSchema extends SModelElementSchema {
    sourceId: string
    targetId: string
}

export class SEdge extends SChildElement implements SEdgeSchema {
    sourceId: string
    targetId: string

    get source(): SNode | undefined {
        return this.index.getById(this.sourceId) as SNode
    }

    get target(): SNode | undefined {
        return this.index.getById(this.targetId) as SNode
    }
}

export type SGraphElementSchema = SNodeSchema | SEdgeSchema
export type SGraphElement = SNode | SEdge
