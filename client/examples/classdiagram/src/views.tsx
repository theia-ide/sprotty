/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { RenderingContext, SNode, RectangularNodeView } from "../../../src"
import { VNode } from "snabbdom/vnode"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

/**
 * A very simple example node consisting of a plain circle.
 */
export class ClassNodeView extends RectangularNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return <g class-node={true}>
            <rect class-node={true} class-selected={node.selected} class-mouseover={node.hoverFeedback}
                  x={0} y={0}
                  width={Math.max(0, node.bounds.width)} height={Math.max(0, node.bounds.height)} />
            {context.renderChildren(node)}
        </g>
    }
}
