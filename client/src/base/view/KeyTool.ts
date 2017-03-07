import {VNodeDecorator} from "./VNodeDecorators"
import {VNode} from "snabbdom/vnode"
import {GModelElement, GModelRoot} from "../model/GModel"
import {Viewer} from "./Viewer"
import {RedoAction, UndoAction} from "../intent/Actions"

export class KeyTool implements VNodeDecorator {

    constructor(private viewer: Viewer) {
    }

    keyPress(element: GModelElement, event: KeyboardEvent): void {

        if (event.metaKey && event.keyCode == 90) {
            event.preventDefault()
            if (event.shiftKey)
                this.viewer.fireAction(new RedoAction)
            else
                this.viewer.fireAction(new UndoAction)
        }
    }

    focus() {
    }

    decorate(vnode: VNode, element: GModelElement): VNode {
        if (element instanceof GModelRoot) {
            if (!vnode.data.on)
                vnode.data.on = {}
            vnode.data.on.focus = [this.focus.bind(this), element]
            vnode.data.on.keypress = [this.keyPress.bind(this), element]
            vnode.data.on.keydown = [this.keyPress.bind(this), element]
            vnode.data.on.keyup = [this.keyPress.bind(this), element]
        }

        return vnode
    }
}