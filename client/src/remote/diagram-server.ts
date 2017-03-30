import { Action, ActionHandler } from "../base/intent/actions"
import { Command } from "../base/intent/commands"

export interface IDiagramServer {
    sendAction(action: Action): void

    onAction(listener: (a: Action) => void): void
}

export interface ActionMessage {
    clientId: string
    action: Action
}

export function isActionMessage(object: any): object is ActionMessage {
    return object !== undefined && object.hasOwnProperty('clientId') && object.hasOwnProperty('action')
}

export class ServerActionHandler implements ActionHandler {
    constructor(private diagramServer: IDiagramServer) {
    }

    handle(action: Action): Command | Action | undefined {
        this.diagramServer.sendAction(action)
        return undefined
    }
}
