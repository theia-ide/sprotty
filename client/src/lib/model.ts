import { SModelRoot, SModelRootSchema, SChildElement, SModelElementSchema } from "../base/model/smodel"
import { Point, Dimension, ORIGIN_POINT, EMPTY_DIMENSION, Bounds } from "../utils/geometry"
import { BoundsAware, boundsFeature } from "../features/bounds/model"
import { Locateable, moveFeature } from "../features/move/model"
import { Selectable, selectFeature } from "../features/select/model"

export interface HtmlRootSchema extends SModelRootSchema {
    classes?: string[]
}

export class HtmlRoot extends SModelRoot {
    classes: string[] = []
}

export interface PreRenderedElementSchema extends SModelElementSchema {
    code: string
}

export class PreRenderedElement extends SChildElement {
    code: string
}

export interface ShapedPreRenderedElementSchema extends SModelElementSchema {
    code: string
    position?: Point
    size?: Dimension
}

export class ShapedPreRenderedElement extends SChildElement implements BoundsAware, Locateable, Selectable {
    code: string
    position: Point = ORIGIN_POINT
    size: Dimension = EMPTY_DIMENSION
    selected: boolean = false

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

    hasFeature(feature: symbol): boolean {
        return feature === moveFeature || feature === boundsFeature || feature === selectFeature
    }
}
