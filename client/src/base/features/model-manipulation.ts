import { injectable } from "inversify"
import { Action } from "../intent/actions"
import { isEmpty } from "../../utils/geometry"
import { SModelRoot, SModelRootSchema } from "../model/smodel"
import { Command, CommandExecutionContext } from "../intent/commands"

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
export class SetModelCommand extends Command {
    static readonly KIND = 'setModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        this.oldRoot = context.root
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        if(!isEmpty(this.oldRoot.canvasBounds)) {
           this.newRoot.canvasBounds = this.oldRoot.canvasBounds 
        }
        return this.newRoot
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return this.oldRoot
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return this.newRoot
    }
}

export class RequestModelAction implements Action {
    static readonly KIND = 'requestModel'
    readonly kind = RequestModelAction.KIND

    constructor(public modelType?: string, public modelId?: string,
        public readonly options?: any) {
    }
}

