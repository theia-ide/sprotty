import "reflect-metadata"
import { injectable, inject, multiInject, optional } from "inversify"
import { VNode } from "snabbdom/vnode"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { TYPES } from "../types"
import { SModelRoot, SModelElement } from "../model/smodel"
import { Action } from "../intent/actions"
import { VNodeDecorator } from "./vnode-decorators"
import {on} from "./vnode-utils"

@injectable()
export class KeyTool implements VNodeDecorator {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher

    @multiInject(TYPES.KeyListener)@optional() protected keyListeners: KeyListener[] = []

    register(keyListener: KeyListener) {
        this.keyListeners.push(keyListener)
    }

    deregister(keyListener: KeyListener) {
        const index = this.keyListeners.indexOf(keyListener)
        if (index >= 0)
            this.keyListeners.splice(index, 1)
    }

    protected handleEvent(methodName: string, model: SModelRoot, event: KeyboardEvent) {
        const actions = this.keyListeners
            .map(listener => listener[methodName].apply(listener, [model, event]))
            .reduce((a, b) => a.concat(b))
        if (actions.length > 0) {
            event.preventDefault()
            this.actionDispatcher.dispatchAll(actions)
        }
    }

    keyPress(element: SModelRoot, event: KeyboardEvent): void {
        this.handleEvent('keyPress', element, event)
    }

    focus() {}

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (element instanceof SModelRoot) {
            on(vnode, 'focus', this.focus.bind(this), element)
            on(vnode, 'keypress', this.keyPress.bind(this), element)
            on(vnode, 'keydown', this.keyPress.bind(this), element)
            on(vnode, 'keyup', this.keyPress.bind(this), element)

        }
        return vnode
    }

    postUpdate() {
    }
}

@injectable()
export class KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        return []
    }
}

