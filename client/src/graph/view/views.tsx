import * as snabbdom from "snabbdom-jsx"
import { VNode } from "snabbdom/vnode"
import { View, RenderingContext } from "../../base/view/views"
import { SGraph, SNode, SEdge } from "../model/sgraph"
import { Point, manhattanDistance } from "../../utils/geometry"

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
    minimalPointDistance: number = 2

    render(edge: SEdge, context: RenderingContext): VNode {
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
        
        const segments = this.computeSegments(edge, source, sourceView, target, targetView)
        
        return <g key={edge.id} id={edge.id}>
            {this.renderLine(edge, segments, context)}
            {this.renderAdditionals(edge, segments, context)}
        </g>
    }

    protected computeSegments(edge: SEdge, source: SNode, sourceView: SNodeView, target: SNode, targetView: SNodeView): Point[] {
        let sourceAnchor: Point
        if (edge.routingPoints !== undefined && edge.routingPoints.length >= 1) {
            // Use the first routing point as start anchor reference
            let p0 = edge.routingPoints[0]
            sourceAnchor = sourceView.getAnchor(source, p0)
        } else {
            // Use the target center as start anchor reference
            const reference = {
                x: target.x + (targetView.getWidth(target) / 2 || 0),
                y: target.y + (targetView.getHeight(target) / 2 || 0)
            }
            sourceAnchor = sourceView.getAnchor(source, reference)
        }
        const result: Point[] = [sourceAnchor]
        let previousPoint = sourceAnchor

        for (let i = 0; i < edge.routingPoints.length - 1; i++) {
            const p = edge.routingPoints[i]
            if (manhattanDistance(previousPoint, p) >= this.minimalPointDistance) {
                result.push(p)
                previousPoint = p
            }
        }

        let targetAnchor: Point
        if (edge.routingPoints && edge.routingPoints.length >= 2) {
            // Use the last routing point as end anchor reference
            let pn = edge.routingPoints[edge.routingPoints.length - 1]
            targetAnchor = targetView.getAnchor(target, pn)
            if (manhattanDistance(previousPoint, pn) >= this.minimalPointDistance
                    && manhattanDistance(pn, targetAnchor) >= this.minimalPointDistance) {
                result.push(pn)
            }
        } else {
            // Use the source center as end anchor reference
            const reference = {
                x: source.x + (sourceView.getWidth(source) / 2 || 0),
                y: source.y + (sourceView.getHeight(source) / 2 || 0)
            }
            targetAnchor = targetView.getAnchor(target, reference)
        }
        result.push(targetAnchor)
        return result
    }

    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0]
        let path = `M ${firstPoint.x},${firstPoint.y}`
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i]
            path += ` L ${p.x},${p.y}`
        }
        return <path class-edge={true} d={path}/>
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        return []
    }


    protected renderDanglingEdge(message: string, edge: SEdge, context: RenderingContext) {
        return <text key={edge.id} id={edge.id} class-dangling-edge={true} title={message}>?</text>
    }
}
