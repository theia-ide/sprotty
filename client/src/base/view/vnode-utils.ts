import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../model/smodel"

export function setAttr(vnode: VNode, name: string, value: any) {
    getAttrs(vnode)[name] = value
}

export function setClass(vnode: VNode, name: string, value: boolean) {
    getClass(vnode)[name] = value
}

export function mergeStyle(vnode: VNode, style: any) {
    getData(vnode).style = {...(getData(vnode).style || {}), ...style}
}

export function on(vnode: VNode, event: string, listener: (any, SModelElement) => void, element: SModelElement) {
    const on = getOn(vnode)
    if (on[event])
        throw new Error('EventListener for ' + event + ' already registered on VNode')
    on[event] = [listener, element]
}

function getAttrs(vnode: VNode) {
    const data = getData(vnode)
    if (!data.attrs)
        data.attrs = {}
    return data.attrs
}

function getData(vnode: VNode) {
    if (!vnode.data)
        vnode.data = {}
    return vnode.data
}

function getClass(vnode: VNode) {
    const data = getData(vnode)
    if (!data.class)
        data.class = {}
    return data.class
}

function getOn(vnode: VNode) {
    const data = getData(vnode)
    if (!data.on)
        data.on = {}
    return data.on
}
