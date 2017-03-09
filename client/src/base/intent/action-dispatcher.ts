import {EventSource} from "../../utils"
import {ViewerCallback} from "../view"
import {IModelSource} from "../model";
import {Action, UndoKind, RedoKind, ActionHandlerRegistry} from "./actions"
import {Command, CommandActionHandler} from "./commands"
import {SetModelKind, SetModelCommand} from "./model-manipulation";
import {SourceDelegateActionHandler} from "./source-delegate";

/**
 * Collects actions, converts them to commands and dispatches them.
 */
export class ActionDispatcher extends EventSource<DispatcherCallback> implements ViewerCallback {

    readonly actionHandlerRegistry = new ActionHandlerRegistry()

    constructor() {
        super()
        this.registerDefaults()
    }

    protected registerDefaults() {
        this.registerCommand(SetModelKind, SetModelCommand)
    }

    registerCommand(kind: string, commandType: new (Action) => Command) {
        this.actionHandlerRegistry.register(kind, new CommandActionHandler(commandType))
    }

    registerSourceDelegate(kind: string,
            sourceDelegateType: new(ActionDispatcher, IModelSource) => SourceDelegateActionHandler,
            source: IModelSource) {
        this.actionHandlerRegistry.register(kind, new sourceDelegateType(this, source))
    }

    execute(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action) {
        this.callbacks.forEach(callback => {
            if (action.kind == UndoKind)
                callback.undo()
            else if (action.kind == RedoKind)
                callback.redo()
            else if (this.actionHandlerRegistry.hasKey(action.kind))
                this.handleAction(action, callback)
        })
    }

    protected handleAction(action: Action, callback: DispatcherCallback) {
        const actionHandler = this.actionHandlerRegistry.get(action.kind)
        const commands = actionHandler.handle(action)
        if (commands.length > 0)
            callback.execute(commands)
    }

}

export interface DispatcherCallback {
    execute(commands: Command[]): void
    undo(): void
    redo(): void
}
