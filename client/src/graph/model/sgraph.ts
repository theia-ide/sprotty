import {
    SModelRootSchema,
    SModelElementSchema,
    SParentElementSchema,
    SChildElement,
    SModelRoot,
} from "../../base/model"
import {Point, Bounds, EMPTY_BOUNDS, IDENTITY_MATRIX} from "../../utils/geometry"
import {BoundsAware} from "../../features/resize/resize"
import {Selectable} from "../../features/select/select"
import {resizeFeature} from "../../features/resize"
import {viewportFeature} from "../../features/viewport"
import {moveFeature} from "../../features/move"
import {selectFeature} from "../../features/select"
import {ViewportRootElement} from "../../features/viewport/viewport-root"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    autosize?: boolean
    width?: number
    height?: number
    scroll: Point
    zoom: number
}

export class SGraph extends ViewportRootElement implements SGraphSchema {
    children: SGraphElement[]
    currentTransformMatrix = IDENTITY_MATRIX
}

export interface SNodeSchema extends SParentElementSchema {
    x?: number
    y?: number
    width?: number
    height?: number
    autosize?: boolean
    children?: SGraphElementSchema[]
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, BoundsAware {
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0
    autosize: boolean = true
    clientBounds: Bounds = EMPTY_BOUNDS
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
        return feature === selectFeature || feature === moveFeature || feature === resizeFeature
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
