import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {GNode} from "../graph/model"
import {GNodeView} from "../graph/view"
import {Point} from "../utils"
import {RenderingContext} from "../base/view"

/**
 * A very simple example node consisting of a plain circle.
 */
export class CircleNodeView extends GNodeView {
    render(node: GNode, context: RenderingContext): VNode {
        return h('circle', {
            class: {
                node: true,
            },
            attrs: {
                id: node.id,
                key: node.id,
                r: 40
            }
        });
    }

    getAnchor(node: GNode, refPoint: Point, arrowLength: number) {
        const dx = node.x - refPoint.x;
        const dy = node.y - refPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normX = dx / distance;
        const normY = dy / distance;
        return {
            x: node.x - normX * (40 + arrowLength),
            y: node.y - normY * (40 + arrowLength)
        }
    }
}
