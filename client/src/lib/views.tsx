import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {RenderingContext} from "../base"
import { SNodeView, SNode } from "../graph"
import {Point} from "../utils"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

export abstract class CircularNodeView extends SNodeView {
    protected abstract getRadius(node: SNode)

    getWidth(node: SNode): number {
        if (node.width)
            return node.width
        else
            return this.getRadius(node) * 2;
    }

    getHeight(node: SNode): number {
        if (node.height)
            return node.height
        else
            return this.getRadius(node) * 2;
    }

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
        else if (x > node.x + this.getWidth(node))
            x = node.x + this.getWidth(node)
        let y = refPoint.y
        if (y < node.y)
            y = node.y
        else if (y > node.y + this.getHeight(node))
            y = node.y + this.getHeight(node)
        return {x, y}
    }
}
