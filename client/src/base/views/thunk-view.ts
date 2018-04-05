/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { h } from "snabbdom";
import { VNode, VNodeData } from "snabbdom/vnode";
import { SModelElement } from "../model/smodel";
import { RenderingContext, IView } from "./view";

/**
 * An view that avoids calculation and patching of VNodes unless some model properties have changed.
 * Based on snabbdom's thunks.
 */
export abstract class ThunkView implements IView {

    /**
     * Returns the array of values that are watched for changes.
     * If they haven't change since the last rendering, the VNode is neither recalculated nor patched.
     */
    abstract watchedArgs(model: SModelElement): any[];

    /**
     * Returns the selector of the VNode root, i.e. it's element type.
     */
    abstract selector(model: SModelElement): string;

    /**
     * Calculate the VNode from the input data. Only called if the watched properties change.
     */
    abstract doRender(model: SModelElement, context: RenderingContext): VNode;

    render(model: SModelElement, context: RenderingContext): VNode {
        return h(this.selector(model), {
            key: model.id,
            hook: {
                init: this.init.bind(this),
                prepatch: this.prepatch.bind(this)},
            fn: () => this.renderAndDecorate(model, context),
            args: this.watchedArgs(model),
            thunk: true
        });
    }

    protected renderAndDecorate(model: SModelElement, context: RenderingContext): VNode {
        const vnode = this.doRender(model, context);
        context.decorate(vnode, model);
        return vnode;
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
        const old = oldVnode.data as VNodeData, cur = thunk.data as VNodeData;
        if (!this.equals(old.args as any[], cur.args as any[]))
            this.copyToThunk((cur.fn as any).apply(undefined, cur.args), thunk);
        else
            this.copyToThunk(oldVnode, thunk);
    }

    protected equals(oldArg: any, newArg: any) {
        if (Array.isArray(oldArg) && Array.isArray(newArg)) {
            if (oldArg.length !== newArg.length)
                return false;
            for (let i = 0; i < newArg.length; ++i) {
                if (!this.equals(oldArg[i], newArg[i]))
                    return false;
            }
        } else if (typeof oldArg === 'object' && typeof newArg === 'object') {
            if (Object.keys(oldArg).length !== Object.keys(newArg).length)
                return false;
            for (const key in oldArg) {
                if (key !== 'parent' && key !== 'root' && (!(key in newArg) || !this.equals(oldArg[key], newArg[key])))
                    return false;
            }
        } else if (oldArg !== newArg) {
            return false;
        }
        return true;
    }
}

export interface ThunkVNode extends VNode {
    thunk: boolean
}

export function isThunk(vnode: VNode): vnode is ThunkVNode {
    return 'thunk' in vnode;
}
