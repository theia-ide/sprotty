/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

 /** @jsx html */
import { html } from 'snabbdom-jsx';

import { VNode } from "snabbdom/vnode";
import { IView, RenderingContext } from "../base/views/view";
import { setClass } from "../base/views/vnode-utils";
import { HtmlRoot } from "./model";

export class HtmlRootView implements IView {
    render(model: HtmlRoot, context: RenderingContext): VNode {
        const root = <div>
            { context.renderChildren(model) }
        </div>;
        for (const c of model.classes) {
            setClass(root, c, true);
        }
        return root;
    }
}
