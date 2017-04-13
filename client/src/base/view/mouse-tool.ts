import * as snabbdom from "snabbdom-jsx"
import { inject, injectable, multiInject, optional } from "inversify"
import { VNode } from "snabbdom/vnode"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { TYPES } from "../types"
import { SModelElement, SModelRoot } from "../model/smodel"
import { Action } from "../intent/actions"
import { VNodeDecorator } from "./vnode-decorators"
import { on } from "./vnode-utils"

@injectable()
export class MouseTool implements VNodeDecorator {

    constructor(@inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher,
                @multiInject(TYPES.MouseListener)@optional() protected mouseListeners: MouseListener[] = []) {}

    register(mouseListener: MouseListener) {
        this.mouseListeners.push(mouseListener)
    }

    deregister(mouseListener: MouseListener) {
        const index = this.mouseListeners.indexOf(mouseListener)
        if (index >= 0)
            this.mouseListeners.splice(index, 1)
    }

    protected getTargetElement(model: SModelRoot, event: MouseEvent): SModelElement |undefined {
        let target = event.target as Element
        if (target) {
            while (target && !target.id) {
                target = target.parentElement as Element
            }
            if (target) {
                const element = model.index.getById(target.id)
                return element
            }
        }
        return undefined
    }

    protected handleEvent<K extends keyof MouseListener>(methodName: K, model: SModelRoot, event: MouseEvent) {
        if (document) {
            const domElement = document.getElementById(model.id)
            if (domElement)
                domElement.focus()
        }
        const element = this.getTargetElement(model, event)
        if (!element)
            return
        const actions = this.mouseListeners
            .map(listener => listener[methodName].apply(listener, [element, event]))
            .reduce((a, b) => a.concat(b))
        if (actions.length > 0) {
            event.preventDefault()
            this.actionDispatcher.dispatchAll(actions)
        }
    }

    mouseDown(model: SModelRoot, event: MouseEvent) {
        this.handleEvent('mouseDown', model, event)
    }

    mouseMove(model: SModelRoot, event: MouseEvent) {
        this.handleEvent('mouseMove', model, event)
    }

    mouseUp(model: SModelRoot, event: MouseEvent) {
        this.handleEvent('mouseUp', model, event)
    }

    wheel(model: SModelRoot, event: WheelEvent) {
        this.handleEvent('wheel', model, event)
    }

    decorate(vnode: VNode, element: SModelElement) {
        if (element instanceof SModelRoot) {
            on(vnode, 'mousedown', this.mouseDown.bind(this), element)
            on(vnode, 'mouseup', this.mouseUp.bind(this), element)
            on(vnode, 'mousemove', this.mouseMove.bind(this), element)
            on(vnode, 'wheel', this.wheel.bind(this), element)
            on(vnode, 'contextmenu', (target: SModelElement, event: any) => {
                event.preventDefault()
            }, element)
        }
        vnode = this.mouseListeners.reduce(
            (vnode: VNode, listener: MouseListener) => listener.decorate(vnode, element),
            vnode)
        return vnode
    }

    postUpdate() {
    }
}

@injectable()
export class MouseListener {

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        return []
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        return []
    }

    wheel(target: SModelElement, event: WheelEvent): Action[] {
        return []
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        return vnode
    }
}

