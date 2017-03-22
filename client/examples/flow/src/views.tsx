import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {RenderingContext} from "../../../src/base"
import {SNodeView} from "../../../src/graph"
import {Point} from "../../../src/utils"
import * as snabbdom from "snabbdom-jsx"
import { ExecutionNode, BarrierNode } from "./flowmodel"

const JSX = {createElement: snabbdom.svg}

export class ExecutionNodeView extends SNodeView {
    render(node: ExecutionNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node)
        return <g key={node.id} id={node.id} >
                <circle class-node={true} class-execution={true} class-selected={node.selected} r={radius} cx={radius} cy={radius}></circle>
                <text x={radius} y={radius + 5} class-text={true}>{node.taskName}</text>
            </g>
    }

    private getRadius(node: ExecutionNode) {
        return 20
    }

    getWidth(node: ExecutionNode): number {
        return this.getRadius(node) * 2;
    }

    getHeight(node: ExecutionNode): number {
        return this.getRadius(node) * 2;
    }

    getAnchor(node: ExecutionNode, refPoint: Point) {
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

export class BarrierNodeView extends SNodeView {
    render(node: BarrierNode, context: RenderingContext): VNode {
        return <g key={node.id} id={node.id} >
                <rect class-node={true} class-barrier={true} class-selected={node.selected} x="0" y="0" width={this.getWidth(node)} height={this.getHeight(node)}></rect>
            </g>
    }

    getWidth(node: BarrierNode): number {
        return 50
    }

    getHeight(node: BarrierNode): number {
        return 10
    }

    getAnchor(node: BarrierNode, refPoint: Point) {
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
