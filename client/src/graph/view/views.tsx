import {View, RenderingContext} from "../../base/view"
import {Point} from "../../utils"
import {SGraph, SNode, SEdge} from "../model"
import {VNode} from "snabbdom/vnode"
import * as snabbdom from "snabbdom-jsx"
import {EMPTY_BOUNDS} from "../../utils/geometry"

const JSX = {createElement: snabbdom.svg}

/**
 * View component that turns a SGraph element and its children into a tree of virtual DOM.
 */
export class SGraphView implements View {

    render(model: SGraph, context: RenderingContext): VNode  {
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

    abstract getAnchor(node: SNode, refPoint: Point, arrowLength: number)
}

export class StraightEdgeView implements View {
    render(edge: SEdge, context: RenderingContext) {
        const source = edge.source
        const target = edge.target
        if (source && target) {
            const sourceView = (context.viewer.viewRegistry.get(source.type, source)) as SNodeView
            const sourceAnchor = sourceView.getAnchor(source, target, 0)
            const targetView = (context.viewer.viewRegistry.get(target.type, target)) as SNodeView
            const targetAnchor = targetView.getAnchor(target, source, 0)
            const path = `M ${sourceAnchor.x || 0},${sourceAnchor.y || 0} L ${targetAnchor.x || 0},${targetAnchor.y || 0}`
            return <path key={edge.id} id={edge.id} class-edge={true} d={path} />
        } else {
            return <text key={edge.id} id={edge.id} class-dangling-edge={true}>?</text>
        }
    }
}

