import {Action, IActionHandler} from "./actions"
import {Command} from "./commands"
import {ActionDispatcher} from "./action-dispatcher"

export class RequestActionHandler implements IActionHandler {

    constructor(protected actionDispatcher: ActionDispatcher, protected immediateHandler?: IActionHandler) {
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
        if(this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return [];
    }
}

export class NotificationActionHandler implements IActionHandler {

    constructor(protected actionDispatcher: ActionDispatcher, protected immediateHandler?: IActionHandler) {
    }

    handle(action: Action): Command[] {
        const server = this.actionDispatcher.server
        if(!server)
            throw Error('Cannot send notification. No server connection.')
        server.notify(action)
        if(this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return [];
    }
}
