import * as snabbdom from 'snabbdom-jsx'
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from '../../../src/base'
import { ViewportRootElement } from "../../../src/features"

const JSX = {createElement: snabbdom.svg}

export class SvgView implements IView {
    render(model: ViewportRootElement, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg key={model.id} id={model.id}>
                <g transform={transform}>
                    {context.renderChildren(model, context)}
                </g>
            </svg>
    }
}