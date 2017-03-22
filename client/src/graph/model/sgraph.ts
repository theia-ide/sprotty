import {
    SModelRootSchema,
    SModelElementSchema,
    SParentElementSchema,
    SChildElement,
    SModelRoot,
} from "../../base/model"
import {Point, Bounds, EMPTY_BOUNDS} from "../../utils/geometry"
import {Sizeable} from "../../base/behaviors/resize"
import {Viewport} from "../../base/behaviors/viewport"
import {Selectable} from "../../base/behaviors/select"
import {Moveable} from "../../base/behaviors/move"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    autosize?: boolean
    width?: number
    height?: number
    scroll: Point
    zoom: number
}

export class SGraph extends SModelRoot implements SGraphSchema, Viewport, Sizeable {
    children: SGraphElement[]

    autosize: boolean = true
    width: number = 0
    height: number = 0
    clientBounds: Bounds = EMPTY_BOUNDS

    scroll: Point = { x:0, y:0 }
    zoom: number = 1
}

export interface SNodeSchema extends SParentElementSchema {
    x?: number
    y?: number
    width?: number
    height?: number
    autosize?: boolean
    children?: SGraphElementSchema[]
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, Moveable, Sizeable {
    x: number
    y: number
    width: number = 0
    height: number = 0
    autosize: boolean = true
    children: SGraphElement[]
    selected: boolean = false
}

export interface SEdgeSchema extends SModelElementSchema {
    sourceId: string
    targetId: string
    routingPoints?: Point[]
}

export class SEdge extends SChildElement implements SEdgeSchema {
    sourceId: string
    targetId: string
    routingPoints: Point[] = []

    get source(): SNode | undefined {
        return this.index.getById(this.sourceId) as SNode
    }

    get target(): SNode | undefined {
        return this.index.getById(this.targetId) as SNode
    }
}

export type SGraphElementSchema = SNodeSchema | SEdgeSchema
export type SGraphElement = SNode | SEdge
