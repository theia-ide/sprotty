import {View, RenderingContext} from "../../base/view"
import {Point, manhattanDistance} from "../../utils"
import {SGraph, SNode, SEdge} from "../model"
import {VNode} from "snabbdom/vnode"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

/**
 * View component that turns a SGraph element and its children into a tree of virtual DOM.
 */
export class SGraphView implements View {

    render(model: SGraph, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg key={model.id} id={model.id} class-graph={true}>
            <g transform={transform}>
                {context.viewer.renderChildren(model, context)}
            </g>
        </svg>
    }
}

export abstract class SNodeView implements View {
    abstract render(model: SNode, context: RenderingContext): VNode

    abstract getAnchor(node: SNode, refPoint: Point): Point

    getWidth(node: SNode): number {
        return node.width;
    }

    getHeight(node: SNode): number {
        return node.height;
    }
}

export class StraightEdgeView implements View {
    render(edge: SEdge, context: RenderingContext) {
        const source = edge.source
        if (!source)
            return this.renderDanglingEdge("cannot resolve source", edge, context)

        const target = edge.target
        if (!target)
            return this.renderDanglingEdge("cannot resolve target", edge, context)

        const sourceView = context.viewer.viewRegistry.get(source.type, source)
        if (!(sourceView instanceof SNodeView))
            return this.renderDanglingEdge("expected source view type: SNodeView", edge, context)

        const targetView = context.viewer.viewRegistry.get(target.type, target)
        if (!(targetView instanceof SNodeView))
            return this.renderDanglingEdge("expected target view type: SNodeView", edge, context)

        let path: string
        if (edge.routingPoints && edge.routingPoints.length >= 1) {
            // Use the first routing point as start anchor reference
            let p0 = edge.routingPoints[0]
            const sourceAnchor = sourceView.getAnchor(source, p0)
            if (manhattanDistance(sourceAnchor, p0) > 2)
                path = `M ${sourceAnchor.x},${sourceAnchor.y} L ${p0.x},${p0.y}`
            else
                path = `M ${sourceAnchor.x},${sourceAnchor.y}`

            // Add the remaining routing points except the last one
            for (let i = 1; i < edge.routingPoints.length - 1; i++) {
                let pi = edge.routingPoints[i]
                path += ` L ${pi.x},${pi.y}`
            }
        } else {
            // Use the target center as start anchor reference
            const reference = {
                x: target.x + (targetView.getWidth(target) / 2 || 0),
                y: target.y + (targetView.getHeight(target) / 2 || 0)
            }
            const sourceAnchor = sourceView.getAnchor(source, reference)
            path = `M ${sourceAnchor.x},${sourceAnchor.y}`
        }

        if (edge.routingPoints && edge.routingPoints.length >= 2) {
            // Use the last routing point as end anchor reference
            let pn = edge.routingPoints[edge.routingPoints.length - 1]
            const targetAnchor = targetView.getAnchor(target, pn)
            if (manhattanDistance(targetAnchor, pn) > 2)
                path += ` L ${pn.x},${pn.y} L ${targetAnchor.x},${targetAnchor.y}`
            else
                path += ` L ${targetAnchor.x},${targetAnchor.y}`
        } else {
            // Use the source center as end anchor reference
            const reference = {
                x: source.x + (sourceView.getWidth(source) / 2 || 0),
                y: source.y + (sourceView.getHeight(source) / 2 || 0)
            }
            const targetAnchor = targetView.getAnchor(target, reference)
            path += ` L ${targetAnchor.x},${targetAnchor.y}`
        }

        return <path key={edge.id} id={edge.id} class-edge={true} d={path}/>
    }

    protected renderDanglingEdge(message: string, edge: SEdge, context: RenderingContext) {
        return <text key={edge.id} id={edge.id} class-dangling-edge={true} title={message}>?</text>
    }
}

