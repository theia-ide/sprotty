import { inject, injectable } from "inversify"
import { Action, ActionHandler } from "../base/intent/actions"
import { Command } from "../base/intent/commands"
import { TYPES } from "../base/types"
import { IViewerOptions } from "../base/view/options"
import { ModelSource } from "../base/model/model-source"
import { ILogger } from "../utils/logging"

export interface ActionMessage {
    clientId: string
    action: Action
}

export function isActionMessage(object: any): object is ActionMessage {
    return object !== undefined && object.hasOwnProperty('clientId') && object.hasOwnProperty('action')
}

@injectable()
export abstract class AbstractDiagramServer extends ModelSource {

    @inject(TYPES.ILogger) protected logger: ILogger
    @inject(TYPES.IViewerOptions) protected viewOptions: IViewerOptions

    protected get clientId(): string {
        return this.viewOptions.baseDiv
    }

    handle(action: Action): void {
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
                this.actionDispatcher.dispatch(object.action)
            }
        } else {
            this.logger.error(this, 'received data is not an action message', object)
        }
    }
}
