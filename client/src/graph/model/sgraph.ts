import { SChildElement, SModelElementSchema, SModelRootSchema } from "../../base/model/smodel"
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

export interface SNodeSchema extends SModelElementSchema {
    children?: SGraphElementSchema[]
    bounds?: Bounds
    layout?: string
    revalidateBounds?: boolean
}

export class SNode extends SChildElement implements SNodeSchema, Selectable, BoundsAware, Locateable, Fadeable {
    bounds: Bounds = EMPTY_BOUNDS
    revalidateBounds: boolean = true
    children: SCompartmentElement[]
    layout?: string
    selected: boolean = false
    opacity: number = 1

    get position(): Point {
        return { x: this.bounds.x, y: this.bounds.y }
    }

    set position(point: Point) {
        const newBounds = {
            x: point.x,
            y: point.y,
            width: this.bounds.width,
            height: this.bounds.height
        }
        this.bounds = newBounds
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
    opacity: number = 1

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
