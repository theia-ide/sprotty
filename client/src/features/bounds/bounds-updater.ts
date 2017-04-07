import { inject, injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../../base/model/smodel"
import { VNodeDecorator } from "../../base/view/vnode-decorators"
import { TYPES } from "../../base/types"
import { IActionDispatcher } from "../../base/intent/action-dispatcher"
import { Bounds, isEmpty, EMPTY_BOUNDS } from '../../utils/geometry';
import { ElementAndBounds, SetBoundsAction, SetBoundsInPageAction } from "./bounds-manipulation"
import { BoundsAware, BoundsInPageAware, isBoundsInPageAware, isSizeable } from "./model"
import { Layouter } from "./layout"
import { LAYOUT_TYPES } from "./types"

export class BoundsData {
    vnode?: VNode
    bounds?: Bounds
    boundsInPage?: Bounds
}

/**
 * Grabs the bounds from SVG DOM elements, applies layouts and fires
 * SetBoundsActions.
 *
 * The actual bounds of an element can usually not be determined from the SModel
 * as they depend on the view implementation and CSS stylings. So the best way is
 * to grab them from the live SVG using getBBox(). In order to avoid additional
 * layout passes per frame, we defer the calculation in the next animation frame.
 */
@injectable()
export class BoundsUpdater implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher
    @inject(LAYOUT_TYPES.Layouter) protected layouter : Layouter

    element2boundsData: Map<SModelElement, BoundsData> = new Map

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element) && isEmpty(element.bounds)) {
            this.element2boundsData.set(element, {
                vnode: vnode,
                bounds: EMPTY_BOUNDS,
            })
        }
        if(isBoundsInPageAware(element) && isEmpty(element.boundsInPage)) {
            this.element2boundsData.set(element, {
                vnode: vnode,
                boundsInPage: EMPTY_BOUNDS
            })
        }
        return vnode
    }

    postUpdate() {
        this.getBoundsFromDOM()
        this.getResizesInPageFromDOM()
        this.layouter.layout(this.element2boundsData)
        const resizesInPage : ElementAndBounds[] = []
        const resizes : ElementAndBounds[] = []
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.boundsInPage) 
                    resizesInPage.push({
                        elementId: element.id,
                        newBounds: boundsData.boundsInPage
                    })
                if(boundsData.bounds)
                    resizes.push({
                        elementId: element.id,
                        newBounds: boundsData.bounds
                    })
            })
        this.element2boundsData.clear()
        if(resizesInPage.length > 0)
            this.actionDispatcher.dispatch(new SetBoundsInPageAction(resizesInPage))
        if(resizes.length > 0)
            this.actionDispatcher.dispatch(new SetBoundsAction(resizes))
    }

    protected getResizesInPageFromDOM() {
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.boundsInPage && isBoundsInPageAware(element)) {
                    const vnode = boundsData.vnode
                    if (vnode && vnode.elm) {
                        let newBoundsInPage = this.getBoundsInPage(vnode.elm)
                        boundsData.boundsInPage= newBoundsInPage
                    }
                }
            }
        )
    }

    protected getBoundsFromDOM() {
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.bounds && isSizeable(element)) {
                    const vnode = boundsData.vnode
                    if (vnode && vnode.elm) {
                        boundsData.bounds = this.getBounds(vnode.elm, element)
                    }
                }
            }
        )
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