import { injectable, inject } from "inversify"
import { Action, ActionHandler } from "../base/intent/actions"
import { Command } from "../base/intent/commands"
import { TYPES } from "../base/types"
import { IViewerOptions } from "../base/view/options"
import { ILogger } from "../utils/logging"

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

@injectable()
export abstract class AbstractDiagramServer implements IDiagramServer {

    @inject(TYPES.ILogger) protected logger: ILogger
    @inject(TYPES.IViewerOptions) protected viewOptions: IViewerOptions

    protected readonly actionListeners: ((a: Action) => void)[] = []

    onAction(listener: (a: Action) => void): void {
        this.actionListeners.push(listener)
    }

    protected get clientId(): string {
        return this.viewOptions.baseDiv
    }

    sendAction(action: Action): void {
        const message: ActionMessage = {
            clientId: this.clientId,
            action: action
        }
        this.logger.log(this, 'sending', message)
        this.sendMessage(JSON.stringify(message))
    }

    protected abstract sendMessage(message: string): void

    protected messageReceived(data: any): void {
        const object = typeof(data) == 'string' ? JSON.parse(data) : data
        if (isActionMessage(object) && object.action) {
            if (!object.clientId || object.clientId == this.clientId) {
                this.logger.log(this, 'receiving', object)
                for (let listener of this.actionListeners) {
                    listener(object.action)
                }
            }
        } else {
            this.logger.error(this, 'received data is not an action message', object)
        }
    }
}
