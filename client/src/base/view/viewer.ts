import {h, init} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {Module} from "snabbdom/modules/module"
import {classModule} from "snabbdom/modules/class"
import {propsModule} from "snabbdom/modules/props"
import {attributesModule} from "snabbdom/modules/attributes"
import {styleModule} from "snabbdom/modules/style"
import {eventListenersModule} from "snabbdom/modules/eventlisteners"
import {CommandStackCallback, Action} from "../intent"
import {SModelRoot, SModelElement, SParentElement} from "../model"
import {EventSource} from "../../utils"
import {AddRemoveAnimationDecorator, VNodeDecorator} from "./vnode-decorators"
import {RenderingContext, ViewRegistry} from "./views"
import {KeyTool} from "./key-tool"
import {MouseTool} from "./mouse-tool"

/**
 * The component that turns the model into an SVG DOM.
 * Uses a VDOM based on snabbdom.js for performance.
 */
export class Viewer extends EventSource<ViewerCallback> implements CommandStackCallback, VNodeDecorator {

    viewRegistry = new ViewRegistry()
    patcher: Patcher
    lastVDOM: undefined
    decorators: VNodeDecorator[] = []

    constructor(private baseDiv: string) {
        super()
        this.patcher = this.createPatcher()
        this.decorators = this.createDecorators()
    }

    createDecorators(): VNodeDecorator[] {
        return [new AddRemoveAnimationDecorator(), new KeyTool(this), new MouseTool(this)]
    }

    createModules(): Module[] {
        return [
            classModule,
            propsModule,
            attributesModule,
            styleModule,
            eventListenersModule
        ]
    }

    createPatcher() {
        return init(this.createModules())
    }

    createRenderingContext(model: SModelRoot): RenderingContext {
        return {
            viewer: this,
        }
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        return this.decorators.reduce(
            (vnode: VNode, decorator: VNodeDecorator) => decorator.decorate(vnode, element),
            vnode)
    }

    renderElement(element: SModelElement, context: RenderingContext): VNode {
        const vNode = this.viewRegistry.get(element.type, element).render(element, context)
        return this.decorate(vNode, element)
    }

    renderChildren(element: SParentElement, context: RenderingContext): VNode[] {
        return element.children.map((element) => context.viewer.renderElement(element, context))
    }

    update(model: SModelRoot): void {
        const context = this.createRenderingContext(model)
        const newVDOM = h('div', {
            attrs: {
                id: this.baseDiv,
                class: this.baseDiv
            }
        }, [
            this.renderElement(model, context)
        ])
        if (this.lastVDOM) {
            this.lastVDOM = this.patcher.call(this, this.lastVDOM, newVDOM)
        } else {
            const placeholder = document.getElementById(this.baseDiv)
            this.lastVDOM = this.patcher.call(this, placeholder, newVDOM)
        }
    }

    fireAction(action: Action) {
        this.callbacks.forEach(callback => callback.execute([action]))
    }
}

export type Patcher = (oldRoot: VNode | Element, newRoot: VNode) => VNode

export interface ViewerCallback {
    execute(actions: Action[]): void
}

