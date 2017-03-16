import "reflect-metadata"
import { injectable } from "inversify"
import {VNode} from "snabbdom/vnode"
import {h} from "snabbdom"
import {SModelElement, SModelRoot, SModel} from "../model"
import {ProviderRegistry} from "../../utils"
import {Viewer} from "./viewer"

/**
 * Base interface for the components that turn GModelElements into virtual DOM elements.
 */
export interface View {
    render(model: SModelElement, context: RenderingContext): VNode
}

/**
 * Bundles additional data that is passed to views for VNode creation.
 */
export interface RenderingContext {
    viewer: Viewer
}

/**
 * Allows to look up the View for a given SModelElement based on its type.
 */
@injectable()
export class ViewRegistry extends ProviderRegistry<View, SModelElement> {
    constructor() {
        super()
        this.registerDefaults()
    }

    protected registerDefaults() {
        this.register(SModel.EMPTY_ROOT.type, EmptyView)
    }

    missing(key: string, element: SModelElement) {
        return new MissingView()
    }
}

export class EmptyView implements View {
    render(model: SModelRoot, context: RenderingContext): VNode {
        return h('g', {
            key: model.id,
            attrs: {
                id: model.id
            }
        });
    }
}

export class MissingView implements View {
    render(model: SModelElement, context: RenderingContext): VNode {
        const x = (model as any).x || 0
        const y = (model as any).y || 0
        return h('text', {
            class: {
                missing: true
            },
            attrs: {
                'text-anchor': 'middle',
                x: x,
                y: y,
            }
        }, '?' + model.id + '?')
    }
}