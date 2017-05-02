import { inject, injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { almostEquals } from '../../utils'
import { SModelElement } from "../../base/model/smodel"
import { IVNodeDecorator } from "../../base/view/vnode-decorators"
import { TYPES } from "../../base/types"
import { IActionDispatcher } from "../../base/intent/action-dispatcher"
import { Bounds, isEmpty, EMPTY_BOUNDS } from '../../utils/geometry';
import { ComputedBoundsAction, ElementAndBounds, SetBoundsAction } from './bounds-manipulation'
import { BoundsAware, isSizeable } from "./model"
import { Layouter } from "./layout"
import { LAYOUT_TYPES } from "./types"

export class BoundsData {
    vnode?: VNode
    bounds: Bounds
    boundsChanged: boolean
}

/**
 * Grabs the bounds from hidden SVG DOM elements, applies layouts and fires
 * ComputedBoundsActions.
 *
 * The actual bounds of an element can usually not be determined from the SModel
 * as they depend on the view implementation and CSS stylings. So the best way is
 * to grab them from a live (but hidden) SVG using getBBox(). 
 */
@injectable()
export class HiddenBoundsUpdater implements IVNodeDecorator {

    constructor(@inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher,
                @inject(LAYOUT_TYPES.Layouter) protected layouter : Layouter) {}

    private readonly element2boundsData: Map<SModelElement, BoundsData> = new Map

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSizeable(element)) {
            this.element2boundsData.set(element, {
                vnode: vnode,
                bounds: element.bounds,
                boundsChanged: false
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
                if(boundsData.boundsChanged && boundsData.bounds !== undefined)
                    resizes.push({
                        elementId: element.id,
                        newBounds: boundsData.bounds
                    })
            })
        this.element2boundsData.clear()
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
                                && almostEquals(newBounds.height, element.bounds.height))) {
                            boundsData.bounds = newBounds  
                            boundsData.boundsChanged = true
                        }
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
