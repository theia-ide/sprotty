declare module "snabbdom-virtualize" {

    import { VNode } from "snabbdom/vnode";

    interface Options {
        context: Document,
        hooks: Hooks
    }

    type PreHook = () => any;
    type InitHook = (vNode: Element) => any;
    type CreateHook = (emptyVNode: Element, vNode: Element) => any;
    type InsertHook = (vNode: Element) => any;
    type PrePatchHook = (oldVNode: Element, vNode: Element) => any;
    type UpdateHook = (oldVNode: Element, vNode: Element) => any;
    type PostPatchHook = (oldVNode: Element, vNode: Element) => any;
    type DestroyHook = (vNode: Element) => any;
    type RemoveHook = (vNode: Element, removeCallback: () => void) => any;
    type PostHook = () => any;
    interface Hooks {
        pre?: PreHook;
        init?: InitHook;
        create?: CreateHook;
        insert?: InsertHook;
        prepatch?: PrePatchHook;
        update?: UpdateHook;
        postpatch?: PostPatchHook;
        destroy?: DestroyHook;
        remove?: RemoveHook;
        post?: PostHook;
    }

    export default function virtualize(n: Element | string, options?: Options): VNode;

}
