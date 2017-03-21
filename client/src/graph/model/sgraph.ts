import {
    SModelRootSchema,
    SModelElementSchema,
    SParentElementSchema,
    SChildElement,
    SModelRoot,
    Moveable,
    Selectable
} from "../../base/model"
import {Sizeable, Viewport} from "../../base/model/behavior"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    viewX: number
    viewY: number
    zoom: number
}

export class SGraph extends SModelRoot implements SGraphSchema, Viewport {
    children: SGraphElement[]
    viewX: number = 0
    viewY: number = 0
    zoom: number = 1
}

export interface SNodeSchema extends SParentElementSchema {
    x: number
    y: number
    autosize?: boolean
    width?: number
    height?: number
    children?: SGraphElementSchema[]
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, Moveable, Sizeable {
    x: number
    y: number
    autosize: boolean = true
    width: number = 0
    height: number = 0
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
