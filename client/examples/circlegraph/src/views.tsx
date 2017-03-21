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
        return <circle key={node.id} id={node.id} class-node={true} r={this.getRadius(node)}></circle>
    }

    private getRadius(node: SNode) {
        return 40
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
