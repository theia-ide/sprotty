import {VNode} from "snabbdom/vnode"
import {RenderingContext} from "../../../src/base"
import {CircularNodeView, RectangularNodeView} from "../../../src/lib"
import * as snabbdom from "snabbdom-jsx"
import {TaskNode, BarrierNode} from "./flowmodel"

const JSX = {createElement: snabbdom.svg}

export class ExecutionNodeView extends CircularNodeView {
    render(node: TaskNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g key={node.id} id={node.id} >
                <circle class-node={true} class-execution={true} class-selected={node.selected} r={radius} cx={radius} cy={radius}></circle>
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
