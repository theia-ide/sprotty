import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {GNodeView} from "../../../src/graph/view/views"
import {RenderingContext} from "../../../src/base/view/views"
import {SNode} from "../../../src/graph/model/sgraph"
import {Point} from "../../../src/utils/geometry"

/**
 * A very simple example node consisting of a plain circle.
 */
export class CircleNodeView extends GNodeView {
    render(node: SNode, context: RenderingContext): VNode {
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

    getAnchor(node: SNode, refPoint: Point, arrowLength: number) {
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
