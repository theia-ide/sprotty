import { Action, ActionHandler } from "../base/intent/actions"
import { Command } from "../base/intent/commands"

export interface IDiagramServer {
    sendAction(action: Action): void

    onAction(listener: (Action) => void)
}

export class ServerActionHandler implements ActionHandler {
    constructor(private diagramServer: IDiagramServer) {
    }

    handle(action: Action): Command | Action | undefined {
        this.diagramServer.sendAction(action)
        return undefined
    }
}
