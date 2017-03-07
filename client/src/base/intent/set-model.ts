import {GModelRoot} from "../model"
import {Command} from "./commands"
import {Action} from "./actions"

export const SetModelKind = 'SetModel'

export class SetModelAction implements Action {
    kind = SetModelKind

    constructor(public readonly newRoot: GModelRoot) {
    }
}

export class SetModelCommand implements Command {
    oldRoot: GModelRoot
    newRoot: GModelRoot

    constructor(public action: SetModelAction) {
    }

    execute(element: GModelRoot) {
        this.oldRoot = element
        this.newRoot = this.action.newRoot
        return this.newRoot
    }

    undo(element: GModelRoot) {
        return this.oldRoot
    }

    redo(element: GModelRoot) {
        return this.newRoot
    }

    merge(command: Command): boolean {
        return false
    }
}
