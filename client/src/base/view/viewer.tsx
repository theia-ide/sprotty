import { inject, injectable, multiInject, optional } from "inversify"
import * as snabbdom from "snabbdom-jsx"
import { init } from "snabbdom"
import { VNode } from "snabbdom/vnode"
import { Module } from "snabbdom/modules/module"
import { propsModule } from "snabbdom/modules/props"
import { attributesModule } from "snabbdom/modules/attributes"
import { styleModule } from "snabbdom/modules/style"
import { eventListenersModule } from "snabbdom/modules/eventlisteners"
import { classModule } from "snabbdom/modules/class"
import { SModelElement, SModelRoot, SParentElement } from "../model/smodel"
import { TYPES } from "../types"
import { VNodeDecorator } from "./vnode-decorators"
import { RenderingContext, ViewRegistry } from "./views"
import { setClass } from "./vnode-utils"
import { IViewerOptions } from "./options"
import { ILogger } from "../../utils/logging"
import { isThunk } from "./thunk-view"

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

    @inject(TYPES.ILogger) public logger: ILogger
    @inject(TYPES.ViewRegistry) public viewRegistry: ViewRegistry
    @inject(TYPES.IViewerOptions) protected options: IViewerOptions

    protected readonly patcher: Patcher
    protected lastVDOM: VNode

    constructor(@multiInject(TYPES.VNodeDecorator)@optional() protected decorators: VNodeDecorator[]) {
        this.patcher = this.createPatcher()
    }

    protected createModules(): Module[] {
        return [
            propsModule,
            attributesModule,
            classModule,
            styleModule,
            eventListenersModule
        ]
    }

    protected createPatcher() {
        return init(this.createModules())
    }

    protected createRenderingContext(model: SModelRoot): RenderingContext {
        return {
            viewer: this,
        }
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if(isThunk(vnode))
            return vnode
        this.decorators = this.decorators
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
        this.logger.log(this, 'rendering', JSON.stringify((model as any).boundsInPage))
        const context = this.createRenderingContext(model)
        const newVDOM = <div id={this.options.baseDiv}>
                {this.renderElement(model, context) as VNode}
            </div>
        setClass(newVDOM, this.options.baseDiv, true)
        if (this.lastVDOM) {
            this.lastVDOM = this.patcher.call(this, this.lastVDOM, newVDOM)
        } else {
            const placeholder = document.getElementById(this.options.baseDiv)
            this.lastVDOM = this.patcher.call(this, placeholder, newVDOM)
        }
        this.postUpdate()
    }

}

export type Patcher = (oldRoot: VNode | Element, newRoot: VNode) => VNode

export type IViewerProvider = () => Promise<Viewer>
