import {IModelSource} from "../model"
import {Action, IActionHandler} from "./actions"
import {Command} from "./commands"
import {ActionDispatcher} from "./action-dispatcher"

export abstract class SourceDelegateActionHandler implements IActionHandler {

    constructor(public actionDispatcher: ActionDispatcher, public source?: IModelSource) {
    }

    handle(action: Action): Command[] {
        if (this.source) {
            const promise = this.callSource(action)
            if (promise) {
                promise.then(result => {
                    const followActions = this.getFollowActions(action, result)
                    if (followActions.length > 0)
                        this.actionDispatcher.execute(followActions)
                })
            }
        }
        return this.getImmediateCommands(action)
    }

    protected getImmediateCommands(action: Action): Command[] {
        return []
    }

    protected getFollowActions(action: Action, result): Action[] {
        return []
    }

    protected abstract callSource(action: Action): PromiseLike<any> | undefined

}
