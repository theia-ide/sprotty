import { h } from "snabbdom"
import { VNode, VNodeData } from "snabbdom/vnode"
import { SModelElement } from "../model/smodel"
import { View, RenderingContext } from "./views"

/**
 * An view that avoids calculation and patching of VNodes unless some model properties have changed.
 * Based on snabbdom's thunks.
 */
export abstract class ThunkView implements View {

    /**
     * Returns the array of values that are watched for changes.
     * If they haven't change since the last rendering, the VNode is neither recalculated nor patched.
     */
    abstract watchedArgs(model: SModelElement) : any[]

    /**
     * Returns the selector of the VNode root, i.e. it's element type.
     */
    abstract selector(model: SModelElement) : string

    /**
     * Calculate the VNode from the input data. Only called if the watched properties change.
     */
    abstract doRender(model: SModelElement, context: RenderingContext): VNode

    render(model: SModelElement, context: RenderingContext): VNode {
        return h(this.selector(model), {
            key: model.id,
            hook: {
                init: this.init.bind(this),
                prepatch: this.prepatch.bind(this)},
            fn: () => this.renderAndDecorate(model, context),
            args: this.watchedArgs(model),
            thunk: true
        })
    }

    protected renderAndDecorate(model: SModelElement, context: RenderingContext): VNode {
        const vnode = this.doRender(model, context)
        context.viewer.decorate(vnode, model)
        return vnode
    }

    protected copyToThunk(vnode: VNode, thunk: VNode): void {
        thunk.elm = vnode.elm;
        (vnode.data as VNodeData).fn = (thunk.data as VNodeData).fn;
        (vnode.data as VNodeData).args = (thunk.data as VNodeData).args;
        thunk.data = vnode.data;
        thunk.children = vnode.children;
        thunk.text = vnode.text;
        thunk.elm = vnode.elm;
    }

    protected init(thunk: VNode): void {
        const cur = thunk.data as VNodeData;
        const vnode = (cur.fn as any).apply(undefined, cur.args);
        this.copyToThunk(vnode, thunk);
    }

    protected prepatch(oldVnode: VNode, thunk: VNode): void {
        let i: number, old = oldVnode.data as VNodeData, cur = thunk.data as VNodeData;
        const oldArgs = old.args, args = cur.args;

        if ((oldArgs as any).length !== (args as any).length) {
            this.copyToThunk((cur.fn as any).apply(undefined, args), thunk);
            return;
        }
        for (i = 0; i < (args as any).length; ++i) {
            if ((oldArgs as any)[i] !== (args as any)[i]) {
                this.copyToThunk((cur.fn as any).apply(undefined, args), thunk);
                return;
            }
        }
        this.copyToThunk(oldVnode, thunk);
    }
}