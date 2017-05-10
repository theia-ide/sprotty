import * as snabbdom from "snabbdom-jsx"
import { IView, RenderingContext } from "../base/view/views"
import { TextRoot } from "./model"
import { VNode } from "snabbdom/vnode"

const JSX = {createElement: snabbdom.html}


export class TextRootView implements IView {
    render(model: TextRoot, context: RenderingContext): VNode {
        return <div>
            <div title-class={true}>
                {model.title}
            </div>
            <div body-class={true}>
                {model.body}
            </div>
        </div>

    }

}
