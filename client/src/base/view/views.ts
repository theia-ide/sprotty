import {VNode} from "snabbdom/vnode"
import {h} from "snabbdom"
import {GModelElement, GModelRoot, EMPTY_ROOT} from "../model"
import {ProviderRegistry} from "../../utils"
import {Viewer} from "./viewer"

/**
 * Base interface for the components that turn GModelElements into virtual DOM elements.
 */
export interface View {
    render(model: GModelElement, context: RenderingContext): VNode
}

/**
 * Bundles additional data that is passed to views for VNode creation.
 */
export interface RenderingContext {
    viewRegistry: ViewRegistry
    root: GModelRoot
    viewer: Viewer
}

/**
 * Allows to look up the View for a given GModelElement based on its type.
 */
export class ViewRegistry extends ProviderRegistry<View, GModelElement> {
    constructor() {
        super()
        this.register(EMPTY_ROOT.type, EmptyView)
    }
}

export class EmptyView implements View {
    render(model: GModelRoot, context: RenderingContext): VNode {
        return h('g', {
            key: model.id,
            attrs: {
                id: model.id
            }
        });
    }
}