import "reflect-metadata"
import {injectable, inject} from "inversify"
import {TYPES} from "../types"
import {h, init} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {Module} from "snabbdom/modules/module"
import {propsModule} from "snabbdom/modules/props"
import {attributesModule} from "snabbdom/modules/attributes"
import {styleModule} from "snabbdom/modules/style"
import {eventListenersModule} from "snabbdom/modules/eventlisteners"
import {Action, IActionDispatcher, ActionDispatcherProvider} from "../intent"
import {SModelRoot, SModelElement, SParentElement} from "../model"
import {AddRemoveAnimationDecorator, VNodeDecorator} from "./vnode-decorators"
import {RenderingContext, ViewRegistry} from "./views"
import {KeyTool} from "./key-tool"
import {MouseTool} from "./mouse-tool"
import {Autosizer} from "./autosizer"
import {classModule} from "snabbdom/modules/class"
import {VNodeUtils} from "./vnode-utils"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.html}  // must be html here, as we're creating a div

export interface IViewer {
    update(model: SModelRoot): void
}

/**
 * The component that turns the model into an SVG DOM.
 * Uses a VDOM based on snabbdom.js for performance.
 */
@injectable()
export class Viewer implements VNodeDecorator, IViewer {

    @inject(ViewRegistry) public viewRegistry: ViewRegistry
    @inject(TYPES.ViewerOptions) protected options: ViewerOptions
    @inject(TYPES.ActionDispatcherProvider) protected actionDispatcherProvider: ActionDispatcherProvider

    protected readonly patcher: Patcher
    protected readonly decorators: VNodeDecorator[] = []
    protected actionDispatcher?: IActionDispatcher
    private lastVDOM: any

    constructor() {
        this.patcher = this.createPatcher()
        this.decorators = this.createDecorators()
    }

    createDecorators(): VNodeDecorator[] {
        return [new AddRemoveAnimationDecorator(), new KeyTool(this), new MouseTool(this), new Autosizer(this)]
    }

    createModules(): Module[] {
        return [
            propsModule,
            attributesModule,
            classModule,
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

    postUpdate() {
        this.decorators.forEach(decorator => decorator.postUpdate())
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
        const newVDOM = <div id={this.options.baseDiv}>
                {this.renderElement(model, context) as VNode}
            </div>
        VNodeUtils.setClass(newVDOM, this.options.baseDiv, true)
        if (this.lastVDOM) {
            this.lastVDOM = this.patcher.call(this, this.lastVDOM, newVDOM)
        } else {
            const placeholder = document.getElementById(this.options.baseDiv)
            this.lastVDOM = this.patcher.call(this, placeholder, newVDOM)
        }
        this.postUpdate()
    }

    fireAction(action: Action) {
        this.actionDispatcherProvider().then(actionDispatcher => {
            actionDispatcher.dispatch(action)
        })
    }
}

export type Patcher = (oldRoot: VNode | Element, newRoot: VNode) => VNode

export interface ViewerOptions {
    baseDiv: string
}

export type ViewerProvider = () => Promise<Viewer>
