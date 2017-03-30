
import { SModelRootSchema, SParentElementSchema, SChildElement, SModelElementSchema } from "../../base/model/smodel"
import { Point, IDENTITY_MATRIX, Bounds, EMPTY_BOUNDS } from "../../utils/geometry"
import { ViewportRootElement } from "../../features/viewport/viewport-root"
import { selectFeature, Selectable } from "../../features/select/model"
import { moveFeature } from "../../features/move/model"
import { boundsFeature, BoundsAware } from "../../features/bounds/model"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    width?: number
    height?: number
    scroll: Point
    zoom: number
}

export class SGraph extends ViewportRootElement implements SGraphSchema {
}

export interface SNodeSchema extends SParentElementSchema {
    x?: number
    y?: number
    width?: number
    height?: number
    children?: SGraphElementSchema[]
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, BoundsAware {
    x: number = 0
    y: number = 0
    width: number = -1
    height: number = -1
    children: SGraphElement[]
    selected: boolean = false

    get bounds(): Bounds {
        return {x: this.x, y: this.y, width: this.width, height: this.height}
    }

    set bounds(bounds: Bounds) {
        this.x = bounds.x
        this.y = bounds.y
        this.width = bounds.width
        this.height = bounds.height
    }

    get position(): Point {
        return { x: this.x, y: this.y }
    }

    set position(point: Point) {
        this.x = point.x
        this.y = point.y
    }

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === moveFeature || feature === boundsFeature
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
