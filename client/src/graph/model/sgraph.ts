import { SChildElement, SModelElementSchema, SModelRootSchema } from "../../base/model/smodel"
import { Bounds, EMPTY_BOUNDS, Point, ORIGIN_POINT, Dimension, EMPTY_DIMENSION } from "../../utils/geometry"
import { ViewportRootElement } from "../../features/viewport/viewport-root"
import { Selectable, selectFeature } from "../../features/select/model"
import { Locateable, moveFeature } from "../../features/move/model"
import { BoundsAware, boundsFeature, layoutFeature, Layouting } from "../../features/bounds/model"
import { Fadeable, fadeFeature } from "../../features/fade/model"

export interface SGraphSchema extends SModelRootSchema {
    children: SGraphElementSchema[]
    bounds?: Bounds
    scroll?: Point
    zoom?: number
}

export class SGraph extends ViewportRootElement {
}

export abstract class SShapeElement extends SChildElement implements BoundsAware, Locateable {
    position: Point = ORIGIN_POINT
    size: Dimension = EMPTY_DIMENSION

    get bounds(): Bounds {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height
        }
    }

    set bounds(newBounds: Bounds) {
        this.position = {
            x: newBounds.x,
            y: newBounds.y
        }
        this.size = {
            width: newBounds.width,
            height: newBounds.height
        }
    }

    localToParent(point: Point): Point {
        return {...point, ...{
                x: point.x + this.position.x,
                y: point.y + this.position.y
            }
        }
    }
}

export interface SNodeSchema extends SModelElementSchema {
    children?: SGraphElementSchema[]
    position?: Point
    size?: Dimension
    layout?: string
}

export class SNode extends SShapeElement implements Selectable, BoundsAware, Locateable, Fadeable {
    children: SCompartmentElement[]
    layout?: string
    selected: boolean = false
    opacity: number = 1

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

export class SEdge extends SChildElement implements Fadeable {
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
    position?: Point
    size?: Dimension
    selected?: boolean
}

export class SLabel extends SShapeElement implements BoundsAware, Selectable {
    text: string
    selected: boolean = false

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === selectFeature
    }
}

export interface SCompartmentSchema extends SModelElementSchema {
    children: SCompartmentElementSchema[]
    position?: Point
    size?: Dimension
    layout?: string
}

export class SCompartment extends SShapeElement implements BoundsAware, Layouting {
    children: SCompartmentElement[]
    position: Point
    size: Dimension 
    layout: string

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === layoutFeature
    }
}
