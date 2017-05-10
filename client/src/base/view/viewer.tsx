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
import { IVNodeDecorator } from "./vnode-decorators"
import { RenderingContext, ViewRegistry } from "./views"
import { setClass, setAttr } from "./vnode-utils"
import { ViewerOptions } from "./options"
import { ILogger, LogLevel } from "../../utils/logging"
import { isThunk } from "./thunk-view"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { isUndefined } from "util"

const JSX = {createElement: snabbdom.html}  // must be html here, as we're creating a div

export interface IViewer {
    update(model: SModelRoot): void
    updateHidden(hiddenModel: SModelRoot): void
    updatePopup(popupModel: SModelRoot): void
}

export class ModelRenderer implements RenderingContext {
    constructor(public viewRegistry: ViewRegistry, private decorators: IVNodeDecorator[]) {
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isThunk(vnode))
            return vnode
        return this.decorators.reduce(
            (n: VNode, decorator: IVNodeDecorator) => decorator.decorate(n, element),
            vnode)
    }

    renderElement(element: SModelElement): VNode {
        const vNode = this.viewRegistry.get(element.type, element).render(element, this)
        return this.decorate(vNode, element)
    }

    renderChildren(element: SParentElement): VNode[] {
        return element.children.map((child) => this.renderElement(child))
    }

    postUpdate() {
        this.decorators.forEach(decorator => decorator.postUpdate())
    }
}

export type ModelRendererFactory = (decorators: IVNodeDecorator[]) => ModelRenderer

/**
 * The component that turns the model into an SVG DOM.
 * Uses a VDOM based on snabbdom.js for performance.
 */
@injectable()
export class Viewer implements IViewer {
    protected renderer: ModelRenderer
    protected hiddenRenderer: ModelRenderer
    protected readonly patcher: Patcher
    protected lastVDOM: VNode
    protected lastPopupVDOM: VNode

    constructor(@inject(TYPES.ModelRendererFactory) modelRendererFactory: ModelRendererFactory,
                @multiInject(TYPES.IVNodeDecorator) @optional() protected decorators: IVNodeDecorator[],
                @multiInject(TYPES.HiddenVNodeDecorator) @optional() protected hiddenDecorators: IVNodeDecorator[],
                @inject(TYPES.ViewerOptions) protected options: ViewerOptions,
                @inject(TYPES.ILogger) protected logger: ILogger) {
        this.patcher = this.createPatcher()
        this.renderer = modelRendererFactory(decorators)
        this.hiddenRenderer = modelRendererFactory(hiddenDecorators)
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

    updatePopup(model: SModelRoot): void {
        this.logger.log(this, 'rendering popup', model)

        let content
        let clearPopup = model.type === EMPTY_ROOT.type
        let inlineStyle = {}
        const position = model.canvasBounds

        if (!clearPopup) {
            content = this.renderer.renderElement(model)

            inlineStyle = {
                top: position.y + 'px',
                left: position.x + 'px'
            }
        } else {
            content =  ''
            inlineStyle = {}
        }

        const newVDOM = <div style={inlineStyle} class-hidden={clearPopup} id={this.options.popupDiv}>
            {content}
        </div>

        if (this.lastPopupVDOM !== undefined) {
            this.lastPopupVDOM = this.patcher.call(this, this.lastPopupVDOM, newVDOM)
        } else if (typeof document !== 'undefined') {
            let placeholder = document.getElementById(this.options.popupDiv)
            if (placeholder === null) {
                placeholder = document.createElement("div")
                document.body.appendChild(placeholder)
            }
            this.lastPopupVDOM = this.patcher.call(this, placeholder, newVDOM)
        }
    }

    update(model: SModelRoot): void {
        this.logger.log(this, 'rendering', model)
        const newVDOM = <div id={this.options.baseDiv}>
            {this.renderer.renderElement(model)}
        </div>
        setClass(newVDOM, this.options.baseClass, true)
        if (this.lastVDOM !== undefined) {
            this.lastVDOM = this.patcher.call(this, this.lastVDOM, newVDOM)
        } else if (typeof document !== 'undefined') {
            const placeholder = document.getElementById(this.options.baseDiv)
            this.lastVDOM = this.patcher.call(this, placeholder, newVDOM)
        }
        this.renderer.postUpdate()
    }

    updateHidden(hiddenModel: SModelRoot): void {
        if (this.lastVDOM === undefined) {
            this.update(EMPTY_ROOT)
        }
        this.logger.log(this, 'rendering hidden')
        const hiddenVNode = this.hiddenRenderer.renderElement(hiddenModel)
        setAttr(hiddenVNode, 'opacity', 0)
        setClass(hiddenVNode, 'sprotty-hidden', true)
        const newVDOM = <div id={this.options.baseDiv}>
            {this.lastVDOM.children![0]}
            {hiddenVNode}
        </div>
        setClass(newVDOM, this.options.baseDiv, true)
        this.lastVDOM = this.patcher.call(this, this.lastVDOM, newVDOM)
        this.hiddenRenderer.postUpdate()
    }
}

export type Patcher = (oldRoot: VNode | Element, newRoot: VNode) => VNode

export type IViewerProvider = () => Promise<Viewer>
