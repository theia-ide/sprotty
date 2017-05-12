declare module "snabbdom-jsx" {

    import { VNode } from "snabbdom/vnode";

    type Attributes = { [attr: string]: any };

    type Component = (attrs: Attributes, children: VNode[]) => VNode;

    type Jsx = (
        tag: string | Component | { view?: Component, render?: Component },
        attrs: Attributes,
        children: VNode[] | VNode[][]
    ) => VNode;

    export function JSX(nsURI: string, defNS: string, modules: any[]): Jsx;

    export const svg: Jsx;
    export const html: Jsx;
}

declare namespace JSX {
    export interface IntrinsicElements { [elemName: string]: any; }
    export interface Element {
        sel: string | undefined;
        data: VNodeData | undefined;
        children: Array<Element | string> | undefined;
        elm: Node | undefined;
        text: string | undefined;
        key: Key;
    }
    type Key = string | number;

    interface VNodeData {
        props?: any;
        attrs?: any;
        class?: any;
        style?: any;
        dataset?: any;
        on?: any;
        hero?: any;
        attachData?: any;
        hook?: Hooks;
        key?: Key;
        ns?: string;
        fn?: () => Element;
        args?: Array<any>;
        [key: string]: any;
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
}



