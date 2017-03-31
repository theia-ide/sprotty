import { injectable } from "inversify"
import { Action } from "../intent/actions"
import { SModelRoot, SModelRootSchema } from "../model/smodel"
import { AbstractCommand, CommandExecutionContext } from "../intent/commands"
import { Map } from "../../utils/utils"

export class SetModelAction implements Action {
    readonly kind = SetModelCommand.KIND
    modelType: string
    modelId: string

    constructor(public newRoot: SModelRootSchema) {
        this.modelType = newRoot.type
        this.modelId = newRoot.id
    }
}

@injectable()
export class SetModelCommand extends AbstractCommand {
    static readonly KIND = 'setModel'

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
    readonly kind = RequestModelAction.KIND

    constructor(public modelType?: string, public modelId?: string,
            public readonly options?: Map<string>) {
    }
}

export class UpdateModelAction implements Action {
    static readonly KIND = 'updateModel'
    readonly kind = UpdateModelAction.KIND

    constructor(public modelType: string, public modelId: string) {
    }
}
