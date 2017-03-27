import {
    SModelRootSchema,
    SModelElementSchema,
    SParentElementSchema,
    SChildElement,
    SModelRoot,
} from "../../base/model"
import {Point, Bounds, EMPTY_BOUNDS, IDENTITY_MATRIX} from "../../utils/geometry"
import {Sizeable} from "../../features/resize/resize"
import {Viewport} from "../../features/viewport/viewport"
import {Selectable} from "../../features/select/select"
import {Moveable} from "../../features/move"
import {resizeFeature} from "../../features/resize"
import {viewportFeature} from "../../features/viewport"
import {moveFeature} from "../../features/move"
import {selectFeature} from "../../features/select"

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
    currentTransformMatrix = IDENTITY_MATRIX
    scroll: Point = { x:0, y:0 }
    zoom: number = 1

    hasFeature(feature: symbol): boolean {
        return feature === viewportFeature || feature == resizeFeature
    }
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
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0
    autosize: boolean = true
    children: SGraphElement[]
    selected: boolean = false

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === moveFeature ||feature === resizeFeature
    }
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
