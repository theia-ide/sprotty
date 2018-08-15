/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable, multiInject, optional } from "inversify";
import { VNode } from "snabbdom/vnode";
import { TYPES } from "../types";
import { IActionDispatcher } from "../actions/action-dispatcher";
import { SModelElement, SModelRoot } from "../model/smodel";
import { Action } from "../actions/action";
import { IVNodeDecorator } from "./vnode-decorators";
import { on } from "./vnode-utils";

@injectable()
export class KeyTool implements IVNodeDecorator {

    constructor(@inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher,
                @multiInject(TYPES.KeyListener)@optional() protected keyListeners: KeyListener[] = []) {}

    register(keyListener: KeyListener) {
        this.keyListeners.push(keyListener);
    }

    deregister(keyListener: KeyListener) {
        const index = this.keyListeners.indexOf(keyListener);
        if (index >= 0)
            this.keyListeners.splice(index, 1);
    }

    protected handleEvent<K extends keyof KeyListener>(methodName: K, model: SModelRoot, event: KeyboardEvent) {
        const actions = this.keyListeners
            .map(listener => listener[methodName].apply(listener, [model, event]))
            .reduce((a, b) => a.concat(b));
        if (actions.length > 0) {
            event.preventDefault();
            this.actionDispatcher.dispatchAll(actions);
        }
    }

    keyDown(element: SModelRoot, event: KeyboardEvent): void {
        this.handleEvent('keyDown', element, event);
    }

    focus() {}

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (element instanceof SModelRoot) {
            on(vnode, 'focus', this.focus.bind(this), element);
            on(vnode, 'keydown', this.keyDown.bind(this), element);
        }
        return vnode;
    }

    postUpdate() {
    }
}

@injectable()
export class KeyListener {
    keyDown(element: SModelElement, event: KeyboardEvent): Action[] {
        return [];
    }
}
