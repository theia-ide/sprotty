/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from "snabbdom-jsx"
import { injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { SModelElement, SModelRoot, SParentElement } from "../model/smodel"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { ProviderRegistry } from "../../utils/registry"
import { Point, ORIGIN_POINT } from "../../utils/geometry"

const JSX = {createElement: snabbdom.svg}


/**
 * Base interface for the components that turn GModelElements into virtual DOM elements.
 */
export interface IView {
    render(model: SModelElement, context: RenderingContext, args?: object): VNode
}

/**
 * Bundles additional data that is passed to views for VNode creation.
 */
export interface RenderingContext {
    viewRegistry: ViewRegistry

    decorate(vnode: VNode, element: SModelElement): VNode

    renderElement(element: SModelElement, args?: object): VNode

    renderChildren(element: SParentElement, args?: object): VNode[]
}

/**
 * Allows to look up the IView for a given SModelElement based on its type.
 */
@injectable()
export class ViewRegistry extends ProviderRegistry<IView, SModelElement> {
    constructor() {
        super()
        this.registerDefaults()
    }

    protected registerDefaults() {
        this.register(EMPTY_ROOT.type, EmptyView)
    }

    missing(key: string, element: SModelElement): IView {
        return new MissingView()
    }
}

export class EmptyView implements IView {
    render(model: SModelRoot, context: RenderingContext): VNode {
        return <svg class-sprotty-empty={true} />
    }
}

export class MissingView implements IView {
    render(model: SModelElement, context: RenderingContext): VNode {
        const position: Point = (model as any).position || ORIGIN_POINT
        return <text class-sprotty-missing={true} x={position.x} y={position.y}>?{model.id}?</text>
    }
}