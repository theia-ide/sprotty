import * as snabbdom from "snabbdom-jsx"
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from "../base/view/views"
import { setClass } from "../base/view/vnode-utils"
import { HtmlRoot } from "./model"

const JSX = {createElement: snabbdom.html}

export class HtmlRootView implements IView {
    render(model: HtmlRoot, context: RenderingContext): VNode {
        const root = <div id={model.id}>
            { context.renderChildren(model, context) }
        </div>
        for (const c of model.classes) {
            setClass(root, c, true)
        }
        return root
    }
}
