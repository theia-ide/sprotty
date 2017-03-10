import {VNode} from "snabbdom/vnode"
import {GModelElement, GModelRoot} from "../model"
import {RedoAction, UndoAction} from "../intent"
import {VNodeDecorator} from "./vnode-decorators"
import {Viewer} from "./viewer"

export class KeyTool implements VNodeDecorator {

    constructor(private viewer: Viewer) {
    }

    keyPress(element: GModelElement, event: KeyboardEvent): void {
        if (event.ctrlKey && event.keyCode == 90) {
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