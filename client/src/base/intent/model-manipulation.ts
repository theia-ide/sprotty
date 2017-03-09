import {GModelRoot, GModelRootSchema, GModelFactory} from "../model"
import {Command} from "./commands"
import {Action} from "./actions"
import {SourceDelegateActionHandler} from "./source-delegate";

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

export const FetchModelKind = 'FetchModel'

export class FetchModelAction implements Action {
    kind = FetchModelKind

    constructor(public readonly options: any) {
    }
}

export class FetchModelHandler extends SourceDelegateActionHandler {
    protected callSource(action: FetchModelAction): PromiseLike<any> {
        return this.source.getDiagram({options: action.options})
    }

    protected getFollowActions(action: FetchModelAction, result: GModelRootSchema): Action[] {
        const newRoot = GModelFactory.createModel(result)
        return [new SetModelAction(newRoot)]
    }
}
