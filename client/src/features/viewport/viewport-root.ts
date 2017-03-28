import {SModelRoot} from "../../base/model/smodel"
import {Viewport} from "./viewport"
import {BoundsAware} from "../resize/resize"
import {Bounds, Point, EMPTY_BOUNDS} from "../../utils/geometry"
import {viewportFeature} from "./index"
import {resizeFeature} from "../resize/index"

export class ViewportRootElement extends SModelRoot implements BoundsAware, Viewport {
    autosize: boolean = true
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0

    scroll: Point = { x:0, y:0 }
    zoom: number = 1

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

    hasFeature(feature: symbol) {
        return feature === viewportFeature || feature === resizeFeature
    }
}