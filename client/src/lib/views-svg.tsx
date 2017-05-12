import virtualize from "snabbdom-virtualize/strings"
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from "../base/view/views"
import { SNodeView } from "../graph/view/views"
import { SModelElement } from "../base/model/smodel"
import { SNode } from "../graph/model/sgraph"
import { Point } from "../utils/geometry"
import { PreRenderedElement } from "./model"

export class PreRenderedView implements IView {
    render(model: PreRenderedElement, context: RenderingContext): VNode {
        return virtualize(model.code)
    }
}

export abstract class CircularNodeView extends SNodeView {
    protected abstract getRadius(node: SNode): number

    getAnchor(node: SNode, refPoint: Point) {
        const radius = this.getRadius(node)
        const cx = node.position.x + radius
        const cy = node.position.y + radius
        const dx = cx - refPoint.x
        const dy = cy - refPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const normX = (dx / distance) || 0
        const normY = (dy / distance) || 0
        return {
            x: cx - normX * radius,
            y: cy - normY * radius
        }
    }
}

export abstract class RectangularNodeView extends SNodeView {
    getAnchor(node: SNode, refPoint: Point) {
        const bounds = node.bounds
        let x = refPoint.x
        if (x < bounds.x)
            x = bounds.x
        else if (x > bounds.x + bounds.width)
            x = bounds.x + bounds.width
        let y = refPoint.y
        if (y < bounds.y)
            y = bounds.y
        else if (y > bounds.y + bounds.height)
            y = bounds.y + bounds.height
        return { x, y }
    }
}
