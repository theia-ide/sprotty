import {DiagramServer} from "../../jsonrpc"
import {Action, ActionHandler, ActionHandlerResult} from "./actions"
import {IActionDispatcher} from "./action-dispatcher"

export class RequestActionHandler implements ActionHandler {

    constructor(protected diagramServer: DiagramServer,
                protected actionDispatcher: IActionDispatcher,
                protected immediateHandler?: ActionHandler) {
    }

    handle(action: Action): ActionHandlerResult {
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
            return {}
    }
}

export type RequestActionHandlerFactory = (immediateHandler?: ActionHandler) => RequestActionHandler

export class NotificationActionHandler implements ActionHandler {

    constructor(protected diagramServer: DiagramServer,
                protected immediateHandler?: ActionHandler) {
    }

    handle(action: Action): ActionHandlerResult {
        this.diagramServer.notify(action)
        if (this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return {}
    }
}

export type NotificationActionHandlerFactory = (immediateHandler?: ActionHandler) => NotificationActionHandler
