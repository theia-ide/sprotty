import "reflect-metadata"
import * as snabbdom from "snabbdom-jsx"
import { injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement, SModel, SModelRoot } from "../model/smodel"
import { ProviderRegistry } from "../../utils/utils"
import { Viewer } from "./viewer"

const JSX = {createElement: snabbdom.svg}

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
        return <g key={model.id} id={model.id}></g>
    }
}

export class MissingView implements View {
    render(model: SModelElement, context: RenderingContext): VNode {
        const x = (model as any).x || 0
        const y = (model as any).y || 0
        return <text class-missing={true} id={model.id} x={x} y={y}>?{model.id}?</text>
    }
}