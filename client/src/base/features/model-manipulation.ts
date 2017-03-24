import {CommandExecutionContext, AbstractCommand, Action, ActionHandler, ActionHandlerResult} from "../intent"
import {SModelRootSchema, SModelRoot} from "../model"
import {Map} from "../../utils"
import {injectable} from "inversify"

export class SetModelAction implements Action {
    kind = SetModelCommand.KIND

    constructor(public readonly newRoot: SModelRootSchema) {
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
    kind = RequestModelAction.KIND

    constructor(public readonly options?: Map<string>) {
    }
}

export class UpdateModelAction implements Action {
    static readonly KIND = 'updateModel'
    kind = UpdateModelAction.KIND

    constructor(public readonly modelId: string) {
    }
}

export class RequestOnUpdateHandler implements ActionHandler {
    constructor(private readonly options?: Map<string>) {
    }

    handle(action: UpdateModelAction): ActionHandlerResult {
        return {
            actions: [new RequestModelAction(this.options)]
        }
    }
}
