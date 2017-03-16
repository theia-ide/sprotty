import {EventSource} from "../../utils"
import {ViewerCallback} from "../view"
import {Action, ActionHandlerRegistry, UndoAction, RedoAction} from "./actions"
import {Command, CommandActionHandler} from "./commands"
import {SetModelCommand, SetModelAction} from "./model-manipulation"
import {RequestActionHandler, NotificationActionHandler} from "./server-action-handlers"
import {DiagramServer} from "../../jsonrpc/protocol"

/**
 * Collects actions, converts them to commands and dispatches them.
 */
export class ActionDispatcher extends EventSource<DispatcherCallback> implements ViewerCallback {

    readonly actionHandlerRegistry = new ActionHandlerRegistry()

    private _server?: DiagramServer

    constructor() {
        super()
        this.registerDefaults()
    }

    protected registerDefaults() {
        this.registerCommand(SetModelAction.KIND, SetModelCommand)
    }

    connect(server: DiagramServer): void {
        if (this._server)
            this.disconnect()
        this._server = server
    }

    disconnect(): void {
        if (this._server)
            this._server.dispose()
        this._server = undefined
    }

    get server(): DiagramServer | undefined {
        return this._server
    }

    registerCommand(kind: string, commandType: new (Action) => Command) {
        this.actionHandlerRegistry.register(kind, new CommandActionHandler(commandType))
    }

    registerServerRequest(kind: string, handler?: RequestActionHandler) {
        if (!handler)
            handler = new RequestActionHandler(this)
        this.actionHandlerRegistry.register(kind, handler)
    }

    registerServerNotification(kind: string, handler?: NotificationActionHandler) {
        if (!handler)
            handler = new NotificationActionHandler(this)
        this.actionHandlerRegistry.register(kind, handler)
    }

    execute(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action) {
        this.callbacks.forEach(callback => {
            if (action.kind == UndoAction.KIND)
                callback.undo()
            else if (action.kind == RedoAction.KIND)
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
