import {AbstractCommand} from "../intent/commands"
import {Action} from "../intent/actions"
import {BehaviorSchema} from "../model/behavior"
import {SModelElement, SChildElement, SModelRoot} from "../model/smodel"
import {MouseListener} from "../view/mouse-tool"
import {isCtrlOrCmd} from "../../utils/utils"
import {VNode} from "snabbdom/vnode"
import {VNodeUtils} from "../view/vnode-utils"

export interface Selectable extends BehaviorSchema {
    selected: boolean
}

export function isSelectable(element: SModelElement | Selectable): element is Selectable {
    return 'selected' in element
}

export class SelectAction implements Action {
    static readonly KIND = 'elementSelected'
    kind = SelectAction.KIND

    constructor(public readonly selectedElementsIDs: string[], public readonly deselectedElementsIDs: string[]) {
    }
}

type ElementSelection= {
    element: SChildElement & Selectable
    index: number
}

export class SelectCommand extends AbstractCommand {

    selected: ElementSelection[] = []
    deselected: ElementSelection[] = []

    constructor(public action: SelectAction) {
        super()
    }

    execute(model: SModelRoot): SModelRoot {
        this.action.selectedElementsIDs.forEach(
            id => {
                const element = model.index.getById(id)
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.selected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            })
        this.action.deselectedElementsIDs.forEach(
            id => {
                const element = model.index.getById(id)
                if (element instanceof SChildElement && isSelectable(element)) {
                    this.deselected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            })
        return this.redo(model)
    }

    undo(model: SModelRoot): SModelRoot {
        for (let i = this.selected.length - 1; i >= 0; --i) {
            const selection = this.selected[i]
            const element = selection.element
            element.selected = false
            element.parent.move(element, selection.index)
        }
        this.deselected.reverse().forEach(selection => {
            selection.element.selected = true
        })
        return model
    }

    redo(model: SModelRoot): SModelRoot {
        for (let i = 0; i < this.selected.length; ++i) {
            const selection = this.selected[i]
            const element = selection.element
            const childrenLength = element.parent.children.length
            element.parent.move(element, childrenLength - 1)
        }
        this.selected.forEach(selection => selection.element.selected = true)
        this.deselected.forEach(selection => selection.element.selected = false)
        return model
    }
}

export class SelectMouseListener extends MouseListener {

    wasSelected = false
    hasDragged = false

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button == 0) {
            if (isSelectable(target)) {
                this.hasDragged = false
                let deselectIds: string[] = []
                // multi-selection?
                if (!isCtrlOrCmd(event)) {
                    deselectIds = target.root
                        .index
                        .all()
                        .filter(element => isSelectable(element) && element.selected)
                        .map(element => element.id)
                }
                if (!target.selected) {
                    this.wasSelected = false
                    return [new SelectAction([target.id], deselectIds)]
                } else {

                    if(isCtrlOrCmd(event)) {
                        this.wasSelected = false
                        return [new SelectAction([], [target.id])]
                    } else {
                        this.wasSelected = true
                    }
                }
            }
        }
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        this.hasDragged = true
        return []
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button == 0) {
            if (!this.hasDragged) {
                if (isSelectable(target) && this.wasSelected) {
                    return [new SelectAction([target.id], [])]
                }
            }
        }
        this.hasDragged = false
        return []
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isSelectable(element))
            VNodeUtils.setClass(vnode, 'selected', element.selected)
        return vnode
    }
}