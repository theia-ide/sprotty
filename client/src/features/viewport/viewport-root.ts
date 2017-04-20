import { SModelRoot } from "../../base/model/smodel"
import { Bounds, EMPTY_BOUNDS, Point, ORIGIN_POINT, Dimension, EMPTY_DIMENSION } from "../../utils/geometry"
import { BoundsAware, boundsFeature } from "../bounds/model"
import { Viewport, viewportFeature } from "./model"

export class ViewportRootElement extends SModelRoot implements BoundsAware, Viewport {
    position: Point = ORIGIN_POINT
    size: Dimension = EMPTY_DIMENSION
    revalidateBounds: boolean = true
    boundsInPage: Bounds = EMPTY_BOUNDS

    scroll: Point = { x: 0, y: 0 }
    zoom: number = 1

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

    hasFeature(feature: symbol) {
        return feature === viewportFeature || feature === boundsFeature
    }
}