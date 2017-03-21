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
    centerX: number
    centerY: number
    zoom: number
}

export class SGraph extends SModelRoot implements SGraphSchema, Viewport, Sizeable {
    children: SGraphElement[]
    centerX: number = 0
    centerY: number = 0
    zoom: number = 1
    width: number = 0
    height: number = 0
    autosize: boolean = true
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
