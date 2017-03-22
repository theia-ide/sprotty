import "reflect-metadata"
import {VNodeDecorator} from "./vnode-decorators"
import {VNode} from "snabbdom/vnode"
import {SModelElement} from "../model/smodel"
import {almostEquals, Dimension, Bounds} from "../../utils/geometry"
import {ElementResize, ResizeAction, Sizeable, isSizeable} from "../behaviors/resize"
import {injectable, inject} from "inversify"
import {ActionDispatcher, IActionDispatcher} from "../intent/action-dispatcher"
import {TYPES} from "../types"

class VNodeAndSizeable {
    vnode: VNode
    element: Sizeable & SModelElement
}

@injectable()
export class Autosizer implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher

    sizeables: VNodeAndSizeable[] = []

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
                        const newBounds = this.getBoundingBox(vnode.elm as Element)
                        let shouldResize = !almostEquals(newBounds.width, element.width)
                            || !almostEquals(newBounds.height, element.height)
                        let newClientBounds: Bounds | undefined
                        if(element.clientBounds) {
                            newClientBounds = this.getClientBounds(vnode.elm as Element)
                            shouldResize = shouldResize || this.differ(newBounds, element.clientBounds)
                        }
                        if(shouldResize) {
                            resizes.push({
                                elementId: element.id,
                                newSize: newBounds,
                                newClientBounds: newClientBounds
                            })
                        }
                    }

                }
            )
            this.sizeables = []
            if (resizes.length > 0)
                this.actionDispatcher.dispatch(new ResizeAction(resizes))

        })
    }

    protected getBoundingBox(elm: Element): Bounds {
        const bounds = (elm as any).getBBox()
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected getClientBounds(elm: Element): Bounds {
        const clientBounds = elm.getBoundingClientRect()
        return {
            x: clientBounds.left,
            y: clientBounds.top,
            width: clientBounds.width,
            height: clientBounds.height
        }
    }

    protected differ(b0, b1: Bounds): boolean {
        return !almostEquals(b0.width, b1.width)
            || !almostEquals(b0.height, b1.height)
            || !almostEquals(b0.x, b1.x)
            || !almostEquals(b0.y, b1.y)
    }
}