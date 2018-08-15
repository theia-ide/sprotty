/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import { SModelElement } from "../model/smodel";
import { setAttr } from "./vnode-utils";

/**
 * Manipulates a created VNode after it has been created.
 * Used to register listeners and add animations.
 */
export interface IVNodeDecorator {
    decorate(vnode: VNode, element: SModelElement): VNode

    postUpdate(): void
}

@injectable()
export class FocusFixDecorator implements IVNodeDecorator {

    static tabIndex: number = 1000;

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (vnode.sel && vnode.sel.startsWith('svg'))
            // allows to set focus in Firefox
            setAttr(vnode, 'tabindex', ++FocusFixDecorator.tabIndex);
        return vnode;
    }

    postUpdate(): void {
    }
}
