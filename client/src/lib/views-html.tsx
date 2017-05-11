import * as snabbdom from "snabbdom-jsx"
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from "../base/view/views"
import { setClass } from "../base/view/vnode-utils"
import { TextRoot } from "./model"

const JSX = {createElement: snabbdom.html}

export class TextRootView implements IView {
    render(model: TextRoot, context: RenderingContext): VNode {
        const content: VNode[] = []
        if (model.title.length > 0) {
            const title = <div>
                {model.title}
            </div>
            if (model.titleClass !== undefined)
                setClass(title, model.titleClass, true)
            content.push(title)
        }
        if (model.body.length > 0) {
            const body = <div>
                { model.body.map(text => <p>{ text }</p>) }
            </div>
            if (model.bodyClass !== undefined)
                setClass(body, model.bodyClass, true)
            content.push(body)
        }
        return <div>
            { content }
        </div>
    }
}
