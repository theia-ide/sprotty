import {Action, UndoKind, RedoKind} from "./Actions"
import {EventSource} from "../../utils/Utils"
import {CommandRegistry, Command} from "./Commands"
import {ViewerCallback} from "../view/Viewer"

/**
 * Collects actions, converts them to commands and dispatches them.
 */
export class ActionDispatcher extends EventSource<DispatcherCallback> implements ViewerCallback {

    commandRegistry = new CommandRegistry()

    execute(actions: Action[]): void {
        actions.forEach((action) => this.dispatch(action))
    }

    dispatch(action: Action) {
        this.callbacks.forEach(
            (callback) => {
                if (action.kind == UndoKind)
                    callback.undo()
                else if (action.kind == RedoKind)
                    callback.redo()
                else {
                    const command = this.commandRegistry.get(action.kind, action)
                    callback.execute([command])
                }
            }
        )
    }
}

export interface DispatcherCallback {
    execute(commands: Command[]): void
    undo(): void
    redo(): void
}