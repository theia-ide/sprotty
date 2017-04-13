import * as snabbdom from "snabbdom-jsx"
import { injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement, SModelRoot, SParentElement } from "../model/smodel"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { ProviderRegistry } from "../../utils/registry"
import { Point, ORIGIN_POINT } from "../../utils/geometry"
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
    viewRegistry: ViewRegistry

    decorate(vnode: VNode, element: SModelElement): VNode

    renderElement(element: SModelElement, context: RenderingContext): VNode

    renderChildren(element: SParentElement, context: RenderingContext): VNode[]
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
        this.register(EMPTY_ROOT.type, EmptyView)
    }

    missing(key: string, element: SModelElement): View {
        return new MissingView()
    }
}

export class EmptyView implements View {
    render(model: SModelRoot, context: RenderingContext): VNode {
        return <svg key={model.id} id={model.id} class-empty={true} />
    }
}

export class MissingView implements View {
    render(model: SModelElement, context: RenderingContext): VNode {
        const position: Point = (model as any).position || ORIGIN_POINT
        return <text class-missing={true} id={model.id} x={position.x} y={position.y}>?{model.id}?</text>
    }
}