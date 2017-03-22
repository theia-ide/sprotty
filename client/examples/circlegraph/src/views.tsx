import {RenderingContext} from "../../../src/base"
import {SNode, SNodeView} from "../../../src/graph"
import {Point} from "../../../src/utils"
import {VNode} from "snabbdom/vnode"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

/**
 * A very simple example node consisting of a plain circle.
 */
export class CircleNodeView extends SNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g key={node.id} id={node.id} >
                <circle class-node={true} class-selected={node.selected} r={radius} cx={radius} cy={radius}></circle>
                <text x={radius} y={radius + 7} class-text={true}>{node.id.substr(4)}</text>
            </g>
    }

    private getRadius(node: SNode) {
        return 40
    }

    getWidth(node: SNode): number {
        return this.getRadius(node) * 2;
    }

    getHeight(node: SNode): number {
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
