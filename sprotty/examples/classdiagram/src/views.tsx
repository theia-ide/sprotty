/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

/** @jsx svg */
import { svg } from 'snabbdom-jsx';

import { RenderingContext, RectangularNodeView, IView } from "../../../src";
import { VNode } from "snabbdom/vnode";
import { Icon, ClassNode } from './model';

export class ClassNodeView extends RectangularNodeView {
    render(node: ClassNode, context: RenderingContext): VNode {
        return <g class-node={true}>
            <rect class-sprotty-node={true} class-selected={node.selected} class-mouseover={node.hoverFeedback}
                  x={0} y={0}
                  width={Math.max(0, node.bounds.width)} height={Math.max(0, node.bounds.height)} />
            {context.renderChildren(node)}
        </g>;
    }
}

export class IconView implements IView {

    render(element: Icon, context: RenderingContext): VNode {
        const radius = this.getRadius();
        return <g>
            <circle class-sprotty-icon={true} r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(element)}
        </g>;
    }

    getRadius() {
        return 16;
    }
}
