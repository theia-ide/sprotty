import {VNode} from "snabbdom/vnode"
import {Point} from "../../utils"
import {SelectAction, ElementMove, MoveAction} from "../intent"
import {SModelElement, isMoveable, isSelectable} from "../model"
import {VNodeDecorator} from "./vnode-decorators"
import {Viewer} from "./viewer"
import {SModelRoot, SChildElement} from "../model/smodel"
import {VNodeUtils} from "./vnode-utils"
import {isCtrlOrCmd} from "../../utils/utils"
import * as snabbdom from "snabbdom-jsx"
import {isViewport, Viewport} from "../model/behavior"
import {ViewportAction} from "../intent/viewport"

const JSX = {createElement: snabbdom.svg}

export class MouseTool implements VNodeDecorator {

    hasDragged = false
    wasSelected = false
    lastDragPosition: Point | undefined
    lastScrollPosition: Point |undefined

    constructor(private viewer: Viewer) {
    }

    private getViewport(element: SModelElement): (SModelElement & Viewport) | undefined {
        if(isViewport(element))
            return element
        else {
            const parent = (element as SChildElement).parent
            if(parent)
                return this.getViewport(parent)
            else
                return undefined
        }
    }

    private getTargetElement(model: SModelRoot, event: MouseEvent): SModelElement |undefined{
        const target = event.target as Element
        if(target && target.id) {
            const element = model.index.getById(target.id)
            return element
        } else {
            return undefined
        }
    }

    mouseDown(model: SModelRoot, event: MouseEvent) {
        const element = this.getTargetElement(model, event)
        if(!element)
            return
        if (event.button == 0) {
            if (isSelectable(element)) {
                let deselectIds: string[] = []
                // multi-selection?
                if (!isCtrlOrCmd(event)) {
                    deselectIds = element.root
                        .index
                        .all()
                        .filter(element => isSelectable(element) && element.selected)
                        .map(element => element.id)
                }
                if (!element.selected) {
                    this.wasSelected = false
                    this.viewer.fireAction(new SelectAction([element.id], deselectIds))
                } else {
                    this.wasSelected = true
                }
            }
            if (isMoveable(element)) {
                this.lastDragPosition = {x: event.clientX, y: event.clientY}
            } else {
                this.lastDragPosition = undefined
            }
            this.hasDragged = false
        } else if (event.button == 2) {
            const viewport = this.getViewport(element)
            if(viewport)
                this.lastScrollPosition = {x: event.clientX, y: event.clientY}
            else
                this.lastScrollPosition = undefined
        }
    }

    mouseMove(model: SModelRoot, event: MouseEvent) {
        const element = this.getTargetElement(model, event)
        if(!element)
            return
        if (this.lastDragPosition) {
            this.hasDragged = true
            const dx = event.clientX - this.lastDragPosition.x
            const dy = event.clientY - this.lastDragPosition.y
            const root = element.root
            const nodeMoves: ElementMove[] = []
            root
                .index
                .all()
                .filter(
                    element =>
                    isSelectable(element) && element.selected
                )
                .forEach(
                    element => {
                        if (isMoveable(element)) {
                            nodeMoves.push({
                                elementId: element.id,
                                toPosition: {
                                    x: element.x + dx,
                                    y: element.y + dy
                                }
                            })
                        }
                    })
            if (nodeMoves.length > 0)
                this.viewer.fireAction(new MoveAction(nodeMoves, false))
            this.lastDragPosition = {x: event.clientX, y: event.clientY}
        } else if(this.lastScrollPosition) {
            const viewport = this.getViewport(element)
            if(viewport) {
                const dx = event.clientX - this.lastScrollPosition.x
                const dy = event.clientY - this.lastScrollPosition.y
                const newViewport: Viewport = {
                    viewX: viewport.viewX + dx,
                    viewY: viewport.viewY + dy,
                    zoom: viewport.zoom
                }
                this.lastScrollPosition = {x: event.clientX, y: event.clientY}
                this.viewer.fireAction(new ViewportAction(viewport.id, newViewport, false))
            }
        }
    }

    mouseUp(model: SModelRoot, event: MouseEvent) {
        const element = this.getTargetElement(model, event)
        if(!element)
            return
        if (event.button == 0) {
            if (!this.hasDragged) {
                if (isSelectable(element) && this.wasSelected) {
                    this.viewer.fireAction(new SelectAction([element.id], []))
                }
            }
        }
        this.hasDragged = false
        this.lastDragPosition = undefined
        this.lastScrollPosition = undefined
    }

    decorate(vnode: VNode, element: SModelElement) {
        if (isSelectable(element)) {
            VNodeUtils.setClass(vnode, 'selected', element.selected)
        }
        if (element instanceof SModelRoot) {
            VNodeUtils.on(vnode, 'mousedown', this.mouseDown.bind(this), element)
            VNodeUtils.on(vnode, 'mouseup', this.mouseUp.bind(this), element)
            VNodeUtils.on(vnode, 'mousemove', this.mouseMove.bind(this), element)
            VNodeUtils.on(vnode, 'contextmenu', (element, event) => {
                event.preventDefault()
            }, element)
        }
        if (isMoveable(element)) {
            const translate = 'translate(' + element.x + ', ' + element.y + ')'
            vnode = <g transform={translate}>{vnode}</g>
        }
        return vnode
    }

    postUpdate() {
    }
}
