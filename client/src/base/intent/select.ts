import {GModelRoot, GModelElement, isSelectable, Selectable} from "../model"
import {Command} from "./commands"
import {Action} from "./actions"

export const SelectKind = 'Select'

export class SelectAction implements Action {
    kind = SelectKind

    constructor(public readonly selectedElementsIDs: string[], public readonly deselectedElementsIDs: string[]) {
    }
}

type ElementSelection= {
    element: GModelElement & Selectable
    index: number
}

export class SelectCommand implements Command {

    selected: ElementSelection[] = []
    deselected: ElementSelection[] = []

    constructor(public action: SelectAction) {
    }

    execute(model: GModelRoot): GModelRoot {
        this.action.selectedElementsIDs.forEach(
            id => {
                const element = model.index.getById(id)
                if (element && isSelectable(element)) {
                    this.selected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            })
        this.action.deselectedElementsIDs.forEach(
            id => {
                const element = model.index.getById(id)
                if (element && isSelectable(element)) {
                    this.deselected.push({
                        element: element,
                        index: element.parent.children.indexOf(element)
                    })
                }
            })
        return this.redo(model)
    }

    undo(model: GModelRoot): GModelRoot {
        for (let i = this.selected.length - 1; i >= 0; --i) {
            const selection = this.selected[i]
            const element = selection.element
            element.selected = false
            element.parent!.children.move(element, selection.index)
        }
        this.deselected.reverse().forEach(selection => {
            selection.element.selected = true
        })
        return model
    }

    redo(model: GModelRoot): GModelRoot {
        for (let i = 0; i < this.selected.length; ++i) {
            const selection = this.selected[i]
            const element = selection.element
            const siblings = element.parent!.children
            siblings.move(element, siblings.length() - 1)
        }
        this.selected.forEach(selection => selection.element.selected = true)
        this.deselected.forEach(selection => selection.element.selected = false)
        return model
    }

    merge(command: Command): boolean {
        return false
    }
}