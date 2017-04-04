import * as snabbdom from "snabbdom-jsx"
import { SNodeView } from "../graph/view/views"
import { SNode } from "../graph/model/sgraph"
import { Point } from "../utils/geometry"

const JSX = {createElement: snabbdom.svg}

export abstract class CircularNodeView extends SNodeView {
    protected abstract getRadius(node: SNode): number

    getAnchor(node: SNode, refPoint: Point) {
        const radius = this.getRadius(node)
        const cx = node.x + radius
        const cy = node.y + radius
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
        let x = refPoint.x
        if (x < node.x)
            x = node.x
        else if (x > node.x + node.width)
            x = node.x + node.width
        let y = refPoint.y
        if (y < node.y)
            y = node.y
        else if (y > node.y + node.height)
            y = node.y + node.height
        return {x, y}
    }
}
