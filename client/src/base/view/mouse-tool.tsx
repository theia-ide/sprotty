import {VNode} from "snabbdom/vnode"
import {Point} from "../../utils"
import {SelectAction, ElementMove, MoveAction} from "../intent"
import {SModelElement, isMoveable, isSelectable} from "../model"
import {VNodeDecorator} from "./vnode-decorators"
import {Viewer} from "./viewer"
import {SModelRoot} from "../model/smodel"
import {VNodeUtils} from "./vnode-utils"
import {isCtrlOrCmd} from "../../utils/utils"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

export class MouseTool implements VNodeDecorator {

    hasDragged = false
    wasSelected = false
    lastDragPosition: Point | undefined

    constructor(private viewer: Viewer) {
    }

    mouseDown(element: SModelElement, event: MouseEvent) {
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
    }

    mouseMove(element: SModelElement, event: MouseEvent) {
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
        }
    }

    mouseUp(element: SModelElement, event: MouseEvent) {
        if (!this.hasDragged) {
            if (isSelectable(element) && this.wasSelected) {
                this.viewer.fireAction(new SelectAction([element.id], []))
            }
        }
        this.hasDragged = false
        this.lastDragPosition = undefined
    }

    decorate(vnode: VNode, element: SModelElement) {
        if (isSelectable(element)) {
            VNodeUtils.setClass(vnode, 'selected', element.selected)
        }
        if (isSelectable(element) || isMoveable(element)) {
            VNodeUtils.on(vnode, 'mousedown', this.mouseDown.bind(this), element)
            VNodeUtils.on(vnode, 'mouseup', this.mouseUp.bind(this), element)
        }
        if (element instanceof SModelRoot) {
            VNodeUtils.on(vnode, 'mousemove', this.mouseMove.bind(this), element)
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
