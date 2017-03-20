import {VNodeDecorator} from "./vnode-decorators"
import {VNode} from "snabbdom/vnode"
import {SModelElement} from "../model/smodel"
import {isSizeable, Sizeable} from "../model/behavior"
import {almostEquals} from "../../utils/geometry"
import {Viewer} from "./viewer"
import {ElementResize, ResizeAction} from "../intent/resize"

class VNodeAndSizeable {
    vnode: VNode
    element: Sizeable & SModelElement
}

export class Autosizer implements VNodeDecorator {

    sizeables: VNodeAndSizeable[] = []

    constructor(private viewer: Viewer) {
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element) && element.autosize === true) {
            this.sizeables.push({
                vnode: vnode,
                element: element
            })
        }
        return vnode
    }

    postUpdate() {
        window.requestAnimationFrame(() => {
            const resizes: ElementResize[] = []
            this.sizeables.forEach(
                sizeable => {
                    const vnode = sizeable.vnode
                    const element = sizeable.element
                    if (vnode.elm) {
                        const bounds = (vnode.elm as any).getBBox()
                        if (bounds
                            && (!almostEquals(bounds.width, element.width)
                            || !almostEquals(bounds.height, element.height))) {
                            resizes.push({
                                elementId: element.id,
                                newSize: {
                                    width: bounds.width,
                                    height: bounds.height
                                }
                            })
                        }
                    }

                }
            )
            if (resizes.length > 0)
                this.viewer.fireAction(new ResizeAction(resizes))

        })
    }
}