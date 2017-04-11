import { almostEquals } from '../../utils';
import { inject, injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../../base/model/smodel"
import { VNodeDecorator } from "../../base/view/vnode-decorators"
import { TYPES } from "../../base/types"
import { IActionDispatcher } from "../../base/intent/action-dispatcher"
import { Bounds, isEmpty, EMPTY_BOUNDS } from '../../utils/geometry';
import { ComputedBoundsAction, ElementAndBounds, SetBoundsAction, SetBoundsInPageAction } from './bounds-manipulation';
import { BoundsAware, BoundsInPageAware, isBoundsInPageAware, isSizeable } from "./model"
import { Layouter } from "./layout"
import { LAYOUT_TYPES } from "./types"

export class BoundsData {
    vnode?: VNode
    bounds?: Bounds
}

/**
 * Grabs the bounds from hidden SVG DOM elements, applies layouts and fires
 * SetBoundsActions.
 *
 * The actual bounds of an element can usually not be determined from the SModel
 * as they depend on the view implementation and CSS stylings. So the best way is
 * to grab them from a live (but hidden) SVG using getBBox(). 
 */
@injectable()
export class HiddenBoundsUpdater implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher
    @inject(LAYOUT_TYPES.Layouter) protected layouter : Layouter

    element2boundsData: Map<SModelElement, BoundsData> = new Map

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element) && element.revalidateBounds) {
            this.element2boundsData.set(element, {
                vnode: vnode,
                bounds: EMPTY_BOUNDS,
            })
        }
        return vnode
    }

    postUpdate() {
        this.getBoundsFromDOM()
        this.layouter.layout(this.element2boundsData)
        const resizes : ElementAndBounds[] = []
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.bounds)
                    resizes.push({
                        elementId: element.id,
                        newBounds: boundsData.bounds
                    })
            })
        this.element2boundsData.clear()
        if(resizes.length > 0)
            this.actionDispatcher.dispatch(new ComputedBoundsAction(resizes))
    }

    protected getBoundsFromDOM() {
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.bounds && isSizeable(element)) {
                    const vnode = boundsData.vnode
                    if (vnode && vnode.elm) {
                        const newBounds = this.getBounds(vnode.elm, element)
                        if(!(almostEquals(newBounds.x, element.bounds.x)
                            && almostEquals(newBounds.y, element.bounds.y)
                            && almostEquals(newBounds.width, element.bounds.width)
                            && almostEquals(newBounds.height, element.bounds.height)))
                            boundsData.bounds = newBounds  
                        else 
                            boundsData.bounds = undefined
                    }
                }
            }
        )
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

/**
 * Grabs the bounds from an element in page coordinates and fires a SetBoundsInPageAction.
 * Used to grab the size of the SVG element needed to calculate FitToScreenActions.
 */
@injectable()
export class BoundsInPageUpdater implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher
    @inject(LAYOUT_TYPES.Layouter) protected layouter : Layouter

    element2boundsData: Map<SModelElement, BoundsData> = new Map

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isBoundsInPageAware(element) && isEmpty(element.boundsInPage)) {
            const boundsData = this.element2boundsData.get(element) || { vnode: vnode }
            boundsData.bounds = EMPTY_BOUNDS
            this.element2boundsData.set(element, boundsData)
        }
        return vnode
    }

    postUpdate() {
        this.getResizesInPageFromDOM()
        const resizesInPage : ElementAndBounds[] = []
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.bounds) 
                    resizesInPage.push({
                        elementId: element.id,
                        newBounds: boundsData.bounds
                    })
            })
        this.element2boundsData.clear()
        if(resizesInPage.length > 0)
            this.actionDispatcher.dispatch(new SetBoundsInPageAction(resizesInPage))
    }

    protected getResizesInPageFromDOM() {
        this.element2boundsData.forEach(
            (boundsData, element) => {
                if(boundsData.bounds && isBoundsInPageAware(element)) {
                    const vnode = boundsData.vnode
                    if (vnode && vnode.elm) {
                        let newBoundsInPage = this.getBoundsInPage(vnode.elm)
                        boundsData.bounds = newBoundsInPage
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
}