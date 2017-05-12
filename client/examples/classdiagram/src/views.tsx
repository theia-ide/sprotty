import { RenderingContext } from "../../../src/base"
import { SNode } from "../../../src/graph"
import { VNode } from "snabbdom/vnode"
import * as snabbdom from "snabbdom-jsx"
import { RectangularNodeView } from "../../../src/lib"

const JSX = {createElement: snabbdom.svg}

/**
 * A very simple example node consisting of a plain circle.
 */
export class ClassNodeView extends RectangularNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return <g key={node.id} id={node.id} class-node={true}>
            <rect class-node={true} class-selected={node.selected} class-mouseover={node.hoverFeedback}
                  x={0} y={0}
                  width={Math.max(0, node.bounds.width)} height={Math.max(0, node.bounds.height)} />
            {context.renderChildren(node)}
        </g>
    }
}
