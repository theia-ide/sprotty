import { SChildElement, SModelElementSchema, SModelRootSchema, SParentElementSchema } from "../../base/model/smodel"
import { Bounds, EMPTY_BOUNDS, Point } from "../../utils/geometry"
import { ViewportRootElement } from "../../features/viewport/viewport-root"
import { Selectable, selectFeature } from "../../features/select/model"
import { Locateable, moveFeature } from "../../features/move/model"
import { BoundsAware, boundsFeature, layoutFeature, Layouting } from "../../features/bounds/model"
import { Fadeable, fadeFeature } from "../../features/fade/model"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    bounds?: Bounds
    revalidateBounds?: boolean
    scroll?: Point
    zoom?: number
}

export class SGraph extends ViewportRootElement implements SGraphSchema {
}

export interface SNodeSchema extends SParentElementSchema {
    x?: number
    y?: number
    width?: number
    height?: number
    children?: SGraphElementSchema[]
    layout?: string
    revalidateBounds?: boolean
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, BoundsAware, Locateable, Fadeable {
    x: number = 0
    y: number = 0
    width: number = -1
    height: number = -1
    revalidateBounds: boolean = true
    children: SCompartmentElement[]
    layout?: string
    selected: boolean = false
    alpha: number = 1

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
            || feature === layoutFeature || feature === fadeFeature
    }
}

export interface SEdgeSchema extends SModelElementSchema {
    sourceId: string
    targetId: string
    routingPoints?: Point[]
}

export class SEdge extends SChildElement implements SEdgeSchema, Fadeable {
    sourceId: string
    targetId: string
    routingPoints: Point[] = []
    alpha: number = 1

    get source(): SNode | undefined {
        return this.index.getById(this.sourceId) as SNode
    }

    get target(): SNode | undefined {
        return this.index.getById(this.targetId) as SNode
    }

    hasFeature(feature: symbol): boolean {
        return feature === fadeFeature
    }
}

export type SGraphElementSchema = SNodeSchema | SEdgeSchema
export type SGraphElement = SNode | SEdge
export type SCompartmentElementSchema = SCompartmentSchema | SLabelSchema
export type SCompartmentElement = SCompartment | SLabel

export interface SLabelSchema extends SModelElementSchema {
    text: string
    selected?: boolean
    revalidateBounds?: boolean
    bounds?: Bounds
}

export class SLabel extends SChildElement implements SLabelSchema, BoundsAware, Selectable {
    revalidateBounds: boolean = true
    bounds: Bounds = EMPTY_BOUNDS
    text: string
    selected: boolean = false

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === selectFeature
    }
}

export interface SCompartmentSchema extends SModelElementSchema {
    children: SCompartmentElementSchema[]
    layout?: string
    spacing?: number
    bounds?: Bounds
    revalidateBounds?: boolean
}

export class SCompartment extends SChildElement implements SCompartmentSchema, BoundsAware, Layouting {
    children: SCompartmentElement[]
    layout: string
    revalidateBounds: boolean = true
    bounds: Bounds = EMPTY_BOUNDS

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === layoutFeature
    }
}
