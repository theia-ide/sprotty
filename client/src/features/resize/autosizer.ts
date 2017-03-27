import "reflect-metadata"
import {injectable, inject} from "inversify"
import {VNode} from "snabbdom/vnode"
import {VNodeDecorator} from "../../base/view/vnode-decorators"
import {SModelElement} from "../../base/model/smodel"
import {almostEquals, Bounds, TransformMatrix} from "../../utils/geometry"
import {ElementResize, ResizeAction, Sizeable, isSizeable} from "./resize"
import {IActionDispatcher} from "../../base/intent/action-dispatcher"
import {TYPES} from "../../base/types"

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
        const resizes: ElementResize[] = []
        this.sizeables.forEach(
            sizeable => {
                const vnode = sizeable.vnode
                const element = sizeable.element
                if (vnode.elm) {
                    const newBounds = this.getBoundingBox(vnode.elm)
                    let shouldResize = element.autosize
                        || !almostEquals(newBounds.width, element.width)
                        || !almostEquals(newBounds.height, element.height)
                    let newClientBounds: Bounds | undefined
                    let newCurrentTransformMatrix: TransformMatrix | undefined
                    if (element.clientBounds) {
                        newClientBounds = this.getClientBounds(vnode.elm)
                        shouldResize = shouldResize || this.differ(newBounds, element.clientBounds)
                    }
                    if (element.currentTransformMatrix) {
                        newCurrentTransformMatrix = this.getCurrentTransformMatrix(vnode.elm)
                        shouldResize = shouldResize
                            || !almostEquals(element.currentTransformMatrix.a, newCurrentTransformMatrix.a)
                            || !almostEquals(element.currentTransformMatrix.b, newCurrentTransformMatrix.b)
                            || !almostEquals(element.currentTransformMatrix.c, newCurrentTransformMatrix.c)
                            || !almostEquals(element.currentTransformMatrix.d, newCurrentTransformMatrix.d)
                            || !almostEquals(element.currentTransformMatrix.e, newCurrentTransformMatrix.e)
                            || !almostEquals(element.currentTransformMatrix.f, newCurrentTransformMatrix.f)
                    }
                    if (shouldResize) {
                        resizes.push({
                            elementId: element.id,
                            newSize: newBounds,
                            newClientBounds: newClientBounds,
                            newCurrentTransformMatrix: newCurrentTransformMatrix
                        })
                    }
                }

            }
        )
        this.sizeables = []
        if (resizes.length > 0)
            this.actionDispatcher.dispatchNextFrame(new ResizeAction(resizes))

    }

    protected getBoundingBox(elm: any): Bounds {
        const bounds = elm.getBBox()
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected getClientBounds(elm: any): Bounds {
        const clientBounds = elm.getBoundingClientRect()
        return {
            x: clientBounds.left,
            y: clientBounds.top,
            width: clientBounds.width,
            height: clientBounds.height
        }
    }

    protected getCurrentTransformMatrix(elm: any) {
        const ctm = elm.getCTM()
        return {
            a: ctm.a,
            b: ctm.b,
            c: ctm.c,
            d: ctm.d,
            e: ctm.e,
            f: ctm.f
        }
    }

    protected differ(b0, b1: Bounds): boolean {
        return !almostEquals(b0.width, b1.width)
            || !almostEquals(b0.height, b1.height)
            || !almostEquals(b0.x, b1.x)
            || !almostEquals(b0.y, b1.y)
    }
}