import {VNodeDecorator} from "./vnode-decorators"
import {VNode} from "snabbdom/vnode"
import {SModelElement} from "../model/smodel"
import {isSizeable, Sizeable} from "../model/behavior"
import {almostEquals} from "../../utils/geometry"
import {Viewer} from "./viewer"
import {ElementResize, ResizeAction} from "../intent/resize"

export class Autosizer implements VNodeDecorator {

    resizes: ElementResize[] = []

    constructor(private viewer: Viewer) {
    }

    private nodeInserted(vnode: VNode, element: SModelElement & Sizeable) {
        if (vnode.elm && vnode.elm instanceof Element) {
            const bounds = vnode.elm.getBoundingClientRect()
            if (bounds
                && (!almostEquals(bounds.width, element.width)
                || !almostEquals(bounds.height, element.height))) {
                this.resizes.push({
                    elementId: element.id,
                    newSize: {
                        width: bounds.width,
                        height: bounds.height
                    }
                })
            }
        }
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element) && element.autosize === true) {
            const data = vnode.data!
            if (!data.hook)
                data.hook = {}
            data.hook.postpatch = (vnode) => {
                this.nodeInserted(vnode, element)
            }
        }
        return vnode
    }

    postUpdate() {
        if (this.resizes.length > 0) {
            this.viewer.fireAction(new ResizeAction(this.resizes))
            this.resizes = []
        }
    }
}