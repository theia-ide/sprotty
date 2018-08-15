/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import virtualize from "snabbdom-virtualize/strings";
import { VNode } from "snabbdom/vnode";
import { IView, RenderingContext } from "../base/views/view";
import { PreRenderedElement } from "./model";

export class PreRenderedView implements IView {
    render(model: PreRenderedElement, context: RenderingContext): VNode {
        const node = virtualize(model.code);
        this.correctNamespace(node);
        return node;
    }

    protected correctNamespace(node: VNode) {
        if (node.sel === 'svg' || node.sel === 'g')
            this.setNamespace(node, 'http://www.w3.org/2000/svg');
    }

    protected setNamespace(node: VNode, ns: string) {
        if (node.data === undefined)
            node.data = {};
        node.data.ns = ns;
        const children = node.children;
        if (children !== undefined) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (typeof child !== 'string')
                    this.setNamespace(child, ns);
            }
        }
    }
}
