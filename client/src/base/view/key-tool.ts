import "reflect-metadata"
import {VNode} from "snabbdom/vnode"
import {SModelElement, SModelRoot} from "../model"
import {VNodeDecorator} from "./vnode-decorators"
import {VNodeUtils} from "./vnode-utils"
import {Action} from "../intent/actions"
import {injectable, inject, multiInject, optional} from "inversify"
import {IActionDispatcher} from "../intent/action-dispatcher"
import {TYPES} from "../types"

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
            VNodeUtils.on(vnode, 'focus', this.focus.bind(this), element)
            VNodeUtils.on(vnode, 'keypress', this.keyPress.bind(this), element)
            VNodeUtils.on(vnode, 'keydown', this.keyPress.bind(this), element)
            VNodeUtils.on(vnode, 'keyup', this.keyPress.bind(this), element)

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

