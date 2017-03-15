import {SModelRoot, SModelRootSchema} from "../model"
import {SGraphFactory} from "../../graph/model"
import {Command} from "./commands"
import {Action} from "./actions"


export class SetModelAction implements Action {
    static readonly KIND = 'SetModel'
    kind = SetModelAction.KIND

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


export class RequestModelAction implements Action {
    static readonly KIND = 'RequestModel'
    kind = RequestModelAction.KIND
}

