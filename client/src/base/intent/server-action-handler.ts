
import { IDiagramServer } from "../../remote/diagram-server"
import { ActionHandler, Action, ActionHandlerResult } from "./actions"

export class ServerActionHandler implements ActionHandler {

    constructor(protected diagramServer: IDiagramServer,
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
