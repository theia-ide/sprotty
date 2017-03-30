import { VNode } from "snabbdom/vnode"
import { RenderingContext } from "../../../src/base"
import { SEdge } from "../../../src/graph/model/sgraph"
import { StraightEdgeView } from "../../../src/graph/view/views"
import { CircularNodeView, RectangularNodeView } from "../../../src/lib"
import { Point, angle, toDegrees } from "../../../src/utils/geometry"
import * as snabbdom from "snabbdom-jsx"
import { TaskNode, BarrierNode } from "./flowmodel"

const JSX = {createElement: snabbdom.svg}

export class ExecutionNodeView extends CircularNodeView {
    render(node: TaskNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g key={node.id} id={node.id} >
                <circle class-node={true} class-task={true} class-selected={node.selected} r={radius} cx={radius} cy={radius}></circle>
                <text x={radius} y={radius + 5} class-text={true}>{node.kernel}</text>
            </g>
    }

    protected getRadius(node: TaskNode) {
        return 20
    }
}

export class BarrierNodeView extends RectangularNodeView {
    render(node: BarrierNode, context: RenderingContext): VNode {
        return <g key={node.id} id={node.id} >
                <rect class-node={true} class-barrier={true} class-selected={node.selected} x="0" y="0" width={this.getWidth(node)} height={this.getHeight(node)}></rect>
            </g>
    }

    getWidth(node: BarrierNode): number {
        if (node.width)
            return node.width
        else
            return 50
    }

    getHeight(node: BarrierNode): number {
        if (node.height)
            return node.height
        else
            return 10
    }
}

export class FlowEdgeView extends StraightEdgeView {
    protected renderEnd(edge: SEdge, segments: Point[], context: RenderingContext): VNode | undefined {
        const p1 = segments[segments.length - 2]
        const p2 = segments[segments.length - 1]
        return <path key={edge.id} id={edge.id} class-edge={true} class-arrow={true} d="M 0,0 L 10,-4 L 10,4 Z"
            transform={`rotate(${toDegrees(angle(p2, p1))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
    }
}