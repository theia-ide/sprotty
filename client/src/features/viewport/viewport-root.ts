import { SModelRoot } from "../../base/model/smodel"
import { Bounds, EMPTY_BOUNDS, Point } from "../../utils/geometry"
import { BoundsAware, boundsFeature, BoundsInPageAware } from "../bounds/model"
import { Viewport, viewportFeature } from "./model"

export class ViewportRootElement extends SModelRoot implements BoundsAware, BoundsInPageAware, Viewport {
    bounds: Bounds = EMPTY_BOUNDS
    revalidateBounds: boolean = true
    boundsInPage: Bounds = EMPTY_BOUNDS

    scroll: Point = { x:0, y:0 }
    zoom: number = 1

    hasFeature(feature: symbol) {
        return feature === viewportFeature || feature === boundsFeature
    }
}