import { DiagramServer } from "../../remote"
import { Action, ActionHandler, ActionHandlerResult } from "./actions"
import {Command} from "./commands"
import { IActionDispatcher } from "./action-dispatcher"

export class ServerActionHandler implements ActionHandler {

    constructor(protected diagramServer: DiagramServer,
                protected immediateHandler?: ActionHandler) {
    }

    handle(action: Action): ActionHandlerResult {
        this.diagramServer.sendAction(action)
        if (this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return {}
    }
}

export type ServerActionHandlerFactory = (immediateHandler?: ActionHandler) => ServerActionHandler
