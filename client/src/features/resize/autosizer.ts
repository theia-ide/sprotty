import "reflect-metadata"
import { injectable, inject } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../../base/model/smodel"
import { VNodeDecorator } from "../../base/view/vnode-decorators"
import { TYPES } from "../../base/types"
import { IActionDispatcher } from "../../base/intent/action-dispatcher"
import { almostEquals, Bounds, TransformMatrix } from "../../utils/geometry"
import { ElementResize, ResizeAction } from "./resize"
import { BoundsAware, isSizeable } from "./model"

class VNodeAndSizeable {
    vnode: VNode
    element: BoundsAware & SModelElement
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
                    let newBounds = this.getClientBounds(vnode.elm, element)
                    if (element.autosize
                        || this.differ(newBounds, element.bounds)) {
                        resizes.push({
                            elementId: element.id,
                            newBounds: newBounds,
                        })
                    }
                }

            }
        )
        this.sizeables = []
        if (resizes.length > 0)
            this.actionDispatcher.dispatchNextFrame(new ResizeAction(resizes))

    }

    protected getClientBounds(elm: any, element: BoundsAware): Bounds {
        if (elm instanceof SVGSVGElement) {
            const bounds = elm.getBoundingClientRect()
            return {
                x: bounds.left,
                y: bounds.top,
                width: bounds.width,
                height: bounds.height
            }
        } else {
            const bounds = elm.getBBox()
            return {
                x: bounds.x + element.bounds.x,
                y: bounds.y + element.bounds.y,
                width: bounds.width,
                height: bounds.height
            }
        }
    }

    protected differ(b0, b1: Bounds): boolean {
        return !almostEquals(b0.width, b1.width)
            || !almostEquals(b0.height, b1.height)
            || !almostEquals(b0.x, b1.x)
            || !almostEquals(b0.y, b1.y)
    }
}