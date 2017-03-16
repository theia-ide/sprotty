import {SModelRoot, SModelRootSchema} from "../model"
import {CommandExecutionContext, AbstractCommand} from "./commands"
import {Action} from "./actions"


export class SetModelAction implements Action {
    static readonly KIND = 'setModel'
    kind = SetModelAction.KIND

    constructor(public readonly newRoot: SModelRootSchema) {
    }
}

export class SetModelCommand extends AbstractCommand {
    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
        super()
    }

    execute(element: SModelRoot, context: CommandExecutionContext) {
        this.oldRoot = element
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        return this.newRoot
    }

    undo(element: SModelRoot) {
        return this.oldRoot
    }

    redo(element: SModelRoot) {
        return this.newRoot
    }
}

export class RequestModelAction implements Action {
    static readonly KIND = 'requestModel'
    kind = RequestModelAction.KIND
}

