import {Action, IActionHandler} from "./actions"
import {Command} from "./commands"
import {ActionDispatcher} from "./action-dispatcher"
import {DiagramServer} from "../../jsonrpc/protocol"

export class RequestActionHandler implements IActionHandler {

    constructor(public actionDispatcher: ActionDispatcher) {
    }

    handle(action: Action): Command[] {
        const server = this.actionDispatcher.server
        if(!server)
            throw Error('Cannot send request. No server connection.')
        const promise = server.request(action)
        if (promise) {
            promise.then(result => {
                if(result && result.length > 0)
                    this.actionDispatcher.execute(result)
            })
        }
        return this.getImmediateCommands(action);
    }

    protected getImmediateCommands(action: Action): Command[] {
        return []
    }
}

export class NotificationActionHandler implements IActionHandler {

    constructor(public actionDispatcher: ActionDispatcher) {
    }

    handle(action: Action): Command[] {
        const server = this.actionDispatcher.server
        if(!server)
            throw Error('Cannot send notification. No server connection.')
        server.notify(action)
        return this.getImmediateCommands(action)
    }

    protected getImmediateCommands(action: Action): Command[] {
        return []
    }
}
