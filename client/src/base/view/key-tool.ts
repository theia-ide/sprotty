import {VNode} from "snabbdom/vnode"
import {SModelElement, SModelRoot} from "../model"
import {RedoAction, UndoAction} from "../intent"
import {VNodeDecorator} from "./vnode-decorators"
import {Viewer} from "./viewer"

export class KeyTool implements VNodeDecorator {

    constructor(private viewer: Viewer) {
    }

    keyPress(element: SModelElement, event: KeyboardEvent): void {
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

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (element instanceof SModelRoot) {
            const data = vnode.data!
            if (!data.on)
                data.on = {}
            data.on.focus = [this.focus.bind(this), element]
            data.on.keypress = [this.keyPress.bind(this), element]
            data.on.keydown = [this.keyPress.bind(this), element]
            data.on.keyup = [this.keyPress.bind(this), element]
        }

        return vnode
    }

    postUpdate() {}
}