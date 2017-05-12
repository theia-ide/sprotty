import virtualize from "snabbdom-virtualize/strings"
import { VNode } from "snabbdom/vnode"
import { IView, RenderingContext } from "../base/view/views"
import { setAttr } from "../base/view/vnode-utils"
import { PreRenderedElement } from "./model"

export class PreRenderedView implements IView {
    render(model: PreRenderedElement, context: RenderingContext): VNode {
        const node = virtualize(model.code)
        node.key = model.id
        setAttr(node, 'id', model.id)
        this.correctNamespace(node)
        return node
    }

    protected correctNamespace(node: VNode) {
        if (node.sel === 'svg' || node.sel === 'g')
            this.setNamespace(node, 'http://www.w3.org/2000/svg')
    }

    protected setNamespace(node: VNode, ns: string) {
        if (node.data === undefined)
            node.data = {}
        node.data.ns = ns
        const children = node.children
        if (children !== undefined) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                if (typeof child !== 'string')
                    this.setNamespace(child, ns)
            }
        }
    }
}