import { inject, injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../../base/model/smodel"
import { VNodeDecorator } from "../../base/view/vnode-decorators"
import { TYPES } from "../../base/types"
import { IActionDispatcher } from "../../base/intent/action-dispatcher"
import { Bounds, isEmpty } from "../../utils/geometry"
import { ElementAndBounds, SetBoundsAction, SetBoundsInPageAction } from "./bounds-manipulation"
import { BoundsAware, BoundsInPageAware, isBoundsInPageAware, isSizeable } from "./model"

class VNodeAndBoundsAware {
    vnode: VNode
    element: BoundsAware & SModelElement
}

class VNodeAndBoundsInPageAware {
    vnode: VNode
    element: BoundsInPageAware & SModelElement
}

/**
 * Grabs the bounds from the SVG element and fires a SetBoundsAction.
 *
 * The actual bounds of an element can usually not be determined from the SModel
 * as they depend on the view implementation and CSS stylings. So the best way is
 * to grab them from the live SVG using getBBox(). In order to avoid additional
 * layout passes per frame, we defer the calculation in the next animation frame.
 */
@injectable()
export class BoundsGrabber implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher

    updateBounds: VNodeAndBoundsAware[] = []
    updateBoundsInPage: VNodeAndBoundsInPageAware[] = []

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element) && isEmpty(element.bounds)) {
            this.updateBounds.push({
                vnode: vnode,
                element: element
            })
        }
        if(isBoundsInPageAware(element) && isEmpty(element.boundsInPage)) {
            this.updateBoundsInPage.push({
                vnode: vnode,
                element: element
            })
        }
        return vnode
    }

    postUpdate() {
        const resizes: ElementAndBounds[] = []
        const resizesInPage: ElementAndBounds[] = []
        this.updateBounds.forEach(
            update => {
                const vnode = update.vnode
                const element = update.element
                if (vnode.elm) {
                    let newBounds = this.getBounds(vnode.elm, element)
                    resizes.push({
                        elementId: element.id,
                        newBounds: newBounds,
                    })
                }
            }
        )
        this.updateBoundsInPage.forEach(
            update => {
                const vnode = update.vnode
                const element = update.element
                if (vnode.elm) {
                    let newBoundsInPage = this.getBoundsInPage(vnode.elm)
                    resizesInPage.push({
                        elementId: element.id,
                        newBounds: newBoundsInPage
                    })
                }
            }
        )
        this.updateBounds = []
        this.updateBoundsInPage = []
        if (resizesInPage.length > 0)
            this.actionDispatcher.dispatch(new SetBoundsInPageAction(resizesInPage))
        if (resizes.length > 0) {
            this.actionDispatcher.dispatch(new SetBoundsAction(resizes))
        }

    }

    protected getBoundsInPage(elm: any) {
        const bounds = elm.getBoundingClientRect()
        return {
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected getBounds(elm: any, element: BoundsAware): Bounds {
        const bounds = elm.getBBox()
        return {
            x: bounds.x + element.bounds.x,
            y: bounds.y + element.bounds.y,
            width: bounds.width,
            height: bounds.height
        }
    }
}