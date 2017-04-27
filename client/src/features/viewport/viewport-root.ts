import { SModelRoot } from "../../base/model/smodel"
import { Bounds, EMPTY_BOUNDS, Point, ORIGIN_POINT, Dimension, EMPTY_DIMENSION, isBounds } from "../../utils/geometry"
import { BoundsAware, boundsFeature, Layouting, layoutFeature } from "../bounds/model"
import { Viewport, viewportFeature } from "./model"

export class ViewportRootElement extends SModelRoot implements Viewport {
    scroll: Point = { x: 0, y: 0 }
    zoom: number = 1

    hasFeature(feature: symbol) {
        return feature === viewportFeature 
    }

    localToParent(point: Point): Point {
        if(isBounds(point)) {
            return {...point, ...{
                    x: (point.x - this.scroll.x) * this.zoom,
                    y: (point.y - this.scroll.y) * this.zoom,
                    width: point.width * this.zoom,
                    height: point.height * this.zoom
                }
            }
        }
        return {...point, ...{
                x: (point.x - this.scroll.x) * this.zoom,
                y: (point.y - this.scroll.y) * this.zoom
            }
        }
    }
}