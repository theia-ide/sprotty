import {VNode} from "snabbdom/vnode"
import {SModelElement, SModelRoot} from "../model"
import {RedoAction, UndoAction} from "../intent"
import {VNodeDecorator} from "./vnode-decorators"
import {Viewer} from "./viewer"
import {VNodeUtils} from "./vnode-utils"
import {isMac} from "../../utils/utils"

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
            VNodeUtils.on(vnode, 'focus', this.focus.bind(this), element)
            VNodeUtils.on(vnode, 'keypress', this.keyPress.bind(this), element)
            VNodeUtils.on(vnode, 'keydown', this.keyPress.bind(this), element)
            VNodeUtils.on(vnode, 'keyup', this.keyPress.bind(this), element)
        }
        return vnode
    }

    postUpdate() {}
}