import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {View, RenderingContext} from "../../base/view"
import {Point} from "../../utils"
import {GGraph, GNode, GEdge} from "../model"

/**
 * View component that turns a GGraph element and its children into a tree of virtual DOM.
 */
export class GGraphView implements View {

    render(model: GGraph, context: RenderingContext): VNode {
        const vNode = h('svg', {
                key: model.id,
                class: {
                    graph: true
                },
                attrs: {
                    id: model.id
                }
            }, [
                h('g', {}, context.viewer.renderChildren(model, context))]
        );
        return vNode
    }
}

export abstract class GNodeView implements View {
    abstract render(model: GNode, context: RenderingContext): VNode

    abstract getAnchor(node: GNode, refPoint: Point, arrowLength: number)
}

export class StraightEdgeView implements View {
    render(edge: GEdge, context: RenderingContext) {
        const sourceView = (context.viewer.viewRegistry.get(edge.source.type, edge.source)) as GNodeView
        const sourceAnchor = sourceView.getAnchor(edge.source, edge.target, 0)
        const targetView = (context.viewer.viewRegistry.get(edge.target.type, edge.target)) as GNodeView
        const targetAnchor = targetView.getAnchor(edge.target, edge.source, 0)
        const path = `M ${sourceAnchor.x},${sourceAnchor.y} L ${targetAnchor.x},${targetAnchor.y}`
        return h('path', {
            key: edge.id,
            class: {
                edge: true
            },
            attrs: {
                d: path,
                id: edge.id,
            }
        })
    }
}

