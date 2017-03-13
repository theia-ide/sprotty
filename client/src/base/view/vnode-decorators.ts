import {VNode} from "snabbdom/vnode"
import {GModelElement} from "../model"

/**
 * Manipulates a created VNode after it has been created.
 * Used to register listeners and add animations.
 */
export interface VNodeDecorator {
    decorate(vnode: VNode, element: GModelElement): VNode
}

export class AddRemoveAnimationDecorator implements VNodeDecorator {

    readonly appearFadeStyle = {
        opacity: '0',
        transition: 'opacity 0.5s',
        delayed: {opacity: '1'},
        remove: {opacity: '0'}
    }

    decorate(vnode: VNode, element: GModelElement) {
        vnode.data!.style = this.appearFadeStyle
        return vnode
    }
}