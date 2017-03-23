import { CommandExecutionContext, AbstractCommand, Action, TranslateActionHandler, IActionDispatcher, IActionHandler } from "../intent"
import {SModelRootSchema, SModelRoot} from "../model"
import { Map } from "../../utils"

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

    constructor(public readonly options?: Map<string>) {
    }
}

export class UpdateModelAction implements Action {
    static readonly KIND = 'updateModel'
    kind = UpdateModelAction.KIND

    constructor(public readonly modelId: string) {
    }
}

export class RequestOnUpdateHandler extends TranslateActionHandler {
    constructor(actionDispatcher: IActionDispatcher,
                immediateHandler?: IActionHandler,
                private readonly options?: Map<string>) {
        super(actionDispatcher, immediateHandler)
    }

    protected translate(action: UpdateModelAction): Action[] {
        return [new RequestModelAction(this.options)]
    }
}
