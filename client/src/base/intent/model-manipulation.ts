import {SModelRoot, SModelRootSchema, SModelFactory} from "../model"
import {SGraphFactory} from "../../graph/model";
import {Command} from "./commands"
import {Action} from "./actions"
import {SourceDelegateActionHandler} from "./source-delegate"

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

export const FetchModelKind = 'FetchModel'

export class FetchModelAction implements Action {
    kind = FetchModelKind

    constructor(public readonly options: any) {
    }
}

export class FetchModelHandler extends SourceDelegateActionHandler {
    readonly modelFactory = new SGraphFactory()

    protected callSource(action: FetchModelAction): PromiseLike<any> {
        return this.source.getDiagram({options: action.options})
    }

    protected getFollowActions(action: FetchModelAction, result: SModelRootSchema): Action[] {
        const newRoot = this.modelFactory.createRoot(result)
        return [new SetModelAction(newRoot)]
    }
}
