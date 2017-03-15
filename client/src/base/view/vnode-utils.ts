import {VNode} from "snabbdom/vnode"
import {SModelElement} from "../model/smodel"

export namespace VNodeUtils {

    export function setClass(vnode: VNode, name: string, value: boolean) {
        getClass(vnode)[name] = value
    }

    export function mergeStyle(vnode: VNode, style: any) {
        getData(vnode).style = {...(getData(vnode).style || {}), ...style }
    }

    export function on(vnode: VNode, event:string, listener: (any, SModelElement)=>void, element: SModelElement) {
        const on = getOn(vnode)
        if(on[event])
            throw new Error('EventListener for ' + event + ' already registered on VNode')
        on[event] = [listener, element]
    }

    function getData(vnode: VNode) {
        if(!vnode.data)
            vnode.data = {}
        return vnode.data
    }

    function getClass(vnode: VNode) {
        const data = getData(vnode)
        if(!data.class)
            data.class = {}
        return data.class
    }

    function getOn(vnode: VNode) {
        const data = getData(vnode)
        if(!data.on)
            data.on= {}
        return data.on
    }
}