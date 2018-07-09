/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

/** @jsx svg */
import { svg } from 'snabbdom-jsx';

import { RenderingContext, RectangularNodeView, IView, SNode } from "../../../src";
import { VNode } from "snabbdom/vnode";
import { PopupButton } from "./model";

export class MindmapNodeView extends RectangularNodeView {
    render(node: SNode, context: RenderingContext): VNode {
        return <g class-node={true}>
            <rect class-sprotty-node={true} class-selected={node.selected} class-mouseover={node.hoverFeedback}
                  x={0} y={0} rx={10} ry={10}
                  width={Math.max(0, node.bounds.width)} height={Math.max(0, node.bounds.height)}>
            </rect>
            {context.renderChildren(node)}
        </g>;
    }
}

export class PopupButtonView implements IView {

    static readonly SIZE = 24;

    render(model: PopupButton, context: RenderingContext): VNode {
        switch (model.kind) {
            case 'add-node':
                return <svg>
                    <rect class-sprotty-node={true}
                        x={0} y={0} rx={8} ry={8}
                        width={PopupButtonView.SIZE} height={PopupButtonView.SIZE}>
                    </rect>
                    <rect class-add-icon={true}
                        x={10} y={6} width={4} height={PopupButtonView.SIZE - 12}>
                    </rect>
                    <rect class-add-icon={true}
                        x={6} y={10} width={PopupButtonView.SIZE - 12} height={4}>
                    </rect>
                </svg>;
            case 'remove-node':
                return <svg>
                    <g transform={`rotate(45 ${PopupButtonView.SIZE / 2} ${PopupButtonView.SIZE / 2})`}>
                        <rect class-remove-icon={true}
                            x={10} y={4} width={4} height={PopupButtonView.SIZE - 8}>
                        </rect>
                        <rect class-remove-icon={true}
                            x={4} y={10} width={PopupButtonView.SIZE - 8} height={4}>
                        </rect>
                    </g>
                </svg>;
            default:
                return <svg></svg>;
        }
    }

}
