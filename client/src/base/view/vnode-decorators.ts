import { injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../model/smodel"
import { mergeStyle, setAttr } from "./vnode-utils"

/**
 * Manipulates a created VNode after it has been created.
 * Used to register listeners and add animations.
 */
export interface IVNodeDecorator {
    decorate(vnode: VNode, element: SModelElement): VNode

    postUpdate(): void
}

@injectable()
export class FocusFixDecorator implements IVNodeDecorator {
    decorate(vnode: VNode, element: SModelElement): VNode {
        if (vnode.sel && vnode.sel.startsWith('svg'))
            // allows to set focus in Firefox
            setAttr(vnode, 'tabindex', 0)
        return vnode
    }

    postUpdate(): void {
    }
}
