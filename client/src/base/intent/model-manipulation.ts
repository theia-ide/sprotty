import {SModelRoot, SModelRootSchema} from "../model"
import {SGraphFactory} from "../../graph/model"
import {Command} from "./commands"
import {Action} from "./actions"

export const SetModelKind = 'SetModel'

export class SetModelAction implements Action {
    kind = SetModelKind

    constructor(public readonly newRoot: SModelRoot) {
    }
}

export class SetModelCommand implements Command {
    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
    }

    execute(element: SModelRoot) {
        this.oldRoot = element
        this.newRoot = this.action.newRoot
        return this.newRoot
    }

    undo(element: SModelRoot) {
        return this.oldRoot
    }

    redo(element: SModelRoot) {
        return this.newRoot
    }

    merge(command: Command): boolean {
        return false
    }
}

export const RequestModelKind = 'RequestModel'

export class RequestModelAction implements Action {
    kind = RequestModelKind
}

