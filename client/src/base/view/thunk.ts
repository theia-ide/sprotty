import {VNodeData, VNode} from "snabbdom/vnode"
import {h} from "snabbdom"

/**
 * copied from snabbdom and adapted to fit our needs.
 */
export interface ThunkData extends VNodeData {
    fn: () => VNode;
    args: Array<any>;
}

export interface Thunk extends VNode {
    data: ThunkData;
}

export interface ThunkFn {
    (sel: string, fn: Function, args: Array<any>): Thunk;
    (sel: string, key: any, fn: Function, args: Array<any>): Thunk;
}

function copyToThunk(vnode: VNode, thunk: VNode): void {
    thunk.elm = vnode.elm;
    (vnode.data as VNodeData).fn = (thunk.data as VNodeData).fn;
    (vnode.data as VNodeData).args = (thunk.data as VNodeData).args;
    thunk.data = vnode.data;
    thunk.children = vnode.children;
    thunk.text = vnode.text;
    thunk.elm = vnode.elm;
}

function init(thunk: VNode): void {
    const cur = thunk.data as VNodeData;
    const vnode = (cur.fn as any).apply(undefined, cur.args);
    copyToThunk(vnode, thunk);
}

function prepatch(oldVnode: VNode, thunk: VNode): void {
    let i: number, old = oldVnode.data as VNodeData, cur = thunk.data as VNodeData;
    const oldArgs = old.args, args = cur.args;

    // SPROTTY CHANGE: don't check fns for identity
    if (/*old.fn !== cur.fn || */(oldArgs as any).length !== (args as any).length) {
        copyToThunk((cur.fn as any).apply(undefined, args), thunk);
    }
    for (i = 0; i < (args as any).length; ++i) {
        if ((oldArgs as any)[i] !== (args as any)[i]) {
            copyToThunk((cur.fn as any).apply(undefined, args), thunk);
            return;
        }
    }
    copyToThunk(oldVnode, thunk);
}

// SPROTTY CHANGE: no optional args
export const thunk = function thunk(sel: string, key: any, fn: any, args: any): VNode {
    return h(sel, {
        key: key,
        hook: {init: init, prepatch: prepatch},
        fn: fn,
        args: args
    });
} as ThunkFn;

export default thunk;