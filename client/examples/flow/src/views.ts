import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {RenderingContext} from "../../../src/base"
import {SNode, SNodeView} from "../../../src/graph"
import {Point} from "../../../src/utils"

export class ExecutionNodeView extends SNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return h('circle', {
            class: {
                node: true,
            },
            attrs: {
                id: node.id,
                key: node.id,
                r: this.getRadius(node)
            }
        });
    }

    private getRadius(node: SNode) {
        return 30
    }

    getAnchor(node: SNode, refPoint: Point, arrowLength: number) {
        const dx = node.x - refPoint.x
        const dy = node.y - refPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const normX = (dx / distance) || 0
        const normY = (dy / distance) || 0
        return {
            x: node.x - normX * (this.getRadius(node) + arrowLength),
            y: node.y - normY * (this.getRadius(node) + arrowLength)
        }
    }
}

export class BarrierNodeView extends SNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return h('rect', {
            class: {
                node: true,
            },
            attrs: {
                id: node.id,
                key: node.id,
                width: this.getWidth(node),
                height: this.getHeight(node)
            }
        });
    }

    private getWidth(node: SNode) {
        return 40
    }

    private getHeight(node: SNode) {
        return 8
    }

    getAnchor(node: SNode, refPoint: Point, arrowLength: number) {
        let x = refPoint.x
        if (x < node.x)
            x = node.x
        else if (x > node.x + this.getWidth(node))
            x = node.x + this.getWidth(node)
        let y = refPoint.y
        if (y < node.y)
            y = node.y
        else if (y > node.y + this.getWidth(node))
            y = node.y + this.getWidth(node)
        return {x, y}
    }
}
