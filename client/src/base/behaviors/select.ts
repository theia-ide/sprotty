import {AbstractCommand} from "../intent/commands"
import {Action} from "../intent/actions"
import {BehaviorSchema} from "../model/behavior"
import {SModelElement, SChildElement, SModelRoot} from "../model/smodel"

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