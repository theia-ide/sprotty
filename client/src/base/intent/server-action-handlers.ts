import {DiagramServer} from "../../jsonrpc"
import {Action, IActionHandler} from "./actions"
import {Command} from "./commands"
import {ActionDispatcher} from "./action-dispatcher"

export class RequestActionHandler implements IActionHandler {

    constructor(protected diagramServer: DiagramServer,
                protected actionDispatcher: ActionDispatcher,
                protected immediateHandler?: IActionHandler) {
    }

    handle(action: Action): Command[] {
        const promise = this.diagramServer.request(action)
        if (promise) {
            promise.then(result => {
                if (result) {
                    if (Array.isArray(result)) {
                        if (result.length > 0)
                            this.actionDispatcher.dispatchAll(result)
                    } else {
                        this.actionDispatcher.dispatch(result)
                    }
                }
            })
        }
        if (this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return [];
    }
}

export type RequestActionHandlerFactory = (immediateHandler?: IActionHandler) => RequestActionHandler

export class NotificationActionHandler implements IActionHandler {

    constructor(protected diagramServer: DiagramServer,
                protected immediateHandler?: IActionHandler) {
    }

    handle(action: Action): Command[] {
        this.diagramServer.notify(action)
        if (this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return [];
    }
}

export type NotificationActionHandlerFactory = (immediateHandler?: IActionHandler) => NotificationActionHandler
