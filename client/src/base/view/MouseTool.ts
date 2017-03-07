import {VNodeDecorator} from "./VNodeDecorators"
import {Point} from "../../utils/Geometry"
import {Viewer} from "./Viewer"
import {GModelElement} from "../model/GModel"
import {VNode} from "snabbdom/vnode"
import {SelectAction} from "../intent/Select"
import {isMoveable, isSelectable} from "../model/Behavior"
import {h} from "snabbdom"
import {ElementMove, MoveAction} from "../intent/Move"

export class MouseTool implements VNodeDecorator {

    hasDragged = false
    wasSelected = false
    lastDragPosition: Point

    constructor(private viewer: Viewer) {
    }

    mouseDown(element: GModelElement, event: MouseEvent) {
        if (isSelectable(element)) {
            let deselectIds = []
            if (!event.metaKey) {
                deselectIds = element.getRoot()
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
            this.lastDragPosition = null
        }
        this.hasDragged = false
    }

    mouseMove(element: GModelElement, event: MouseEvent) {
        if (this.lastDragPosition) {
            this.hasDragged = true
            const dx = event.clientX - this.lastDragPosition.x
            const dy = event.clientY - this.lastDragPosition.y
            const root = element.getRoot()
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

    mouseUp(element: GModelElement, event: MouseEvent) {
        if (!this.hasDragged) {
            if (isSelectable(element) && this.wasSelected) {
                this.viewer.fireAction(new SelectAction([element.id], []))
            }
        }
        this.hasDragged = false
        this.lastDragPosition = null
    }

    decorate(vnode: VNode, element: GModelElement) {
        if (!vnode.data.on)
            vnode.data.on = {}
        if (isSelectable(element))
            vnode.data.class.selected = element.selected
        if (isSelectable(element) || isMoveable(element)) {
            vnode.data.on.mousedown = [this.mouseDown.bind(this), element]
            vnode.data.on.mouseup = [this.mouseUp.bind(this), element]
        }
        if (isMoveable(element)) {
            vnode.data.on.mousemove = [this.mouseMove.bind(this), element]
            vnode = h('g', {
                attrs: {
                    transform: 'translate(' + element.x + ', ' + element.y + ')'
                }
            }, [vnode])
        }
        return vnode
    }
}
