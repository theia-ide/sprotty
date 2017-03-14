import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {View, RenderingContext} from "../../base/view"
import {Point} from "../../utils"
import {SGraph, SNode, SEdge} from "../model"

/**
 * View component that turns a SGraph element and its children into a tree of virtual DOM.
 */
export class GGraphView implements View {

    render(model: SGraph, context: RenderingContext): VNode {
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
    abstract render(model: SNode, context: RenderingContext): VNode

    abstract getAnchor(node: SNode, refPoint: Point, arrowLength: number)
}

export class StraightEdgeView implements View {
    render(edge: SEdge, context: RenderingContext) {
        const source = edge.source
        const target = edge.target
        if (source && target) {
            const sourceView = (context.viewer.viewRegistry.get(source.type, source)) as GNodeView
            const sourceAnchor = sourceView.getAnchor(source, target, 0)
            const targetView = (context.viewer.viewRegistry.get(target.type, target)) as GNodeView
            const targetAnchor = targetView.getAnchor(target, source, 0)
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
        } else {
            return h('text', {
                key: edge.id,
                class: {
                    'dangling-edge': true
                },
                attrs: {
                    id: edge.id,
                }
            }, '?')
        }
    }
}

