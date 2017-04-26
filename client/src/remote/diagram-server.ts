import { SetModelAction, SetModelCommand } from "../base/features/model-manipulation"
import { inject, injectable } from "inversify"
import { Action, ActionHandlerRegistry } from "../base/intent/actions"
import { IActionDispatcher } from "../base/intent/action-dispatcher"
import { TYPES } from "../base/types"
import { ViewerOptions } from "../base/view/options"
import { ILogger } from "../utils/logging"
import { SModelStorage } from "../base/model/smodel-storage"
import { SModelRootSchema } from "../base/model/smodel"
import { ModelSource } from "../base/model/model-source"
import { UpdateModelCommand } from "../features/update/update-model"
import { ComputedBoundsAction } from "../features/bounds/bounds-manipulation"

/**
 * Wrapper for messages when transferring them vie a DiagramServer.
 */
export interface ActionMessage {
    clientId: string
    action: Action
}

export function isActionMessage(object: any): object is ActionMessage {
    return object !== undefined && object.hasOwnProperty('clientId') && object.hasOwnProperty('action')
}

/**
 * A ModelSource that communicates with an external model provider, e.g.
 * a model editor.
 * 
 * This class defines which actions are sent to and received from the
 * external model source.
 */
@injectable()
export abstract class DiagramServer extends ModelSource {

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.SModelStorage) protected storage: SModelStorage,
                @inject(TYPES.ILogger) protected logger: ILogger) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions)
        actionDispatcher.dispatch(new SetModelAction(storage.load()))
    }

    protected get clientId(): string {
        return this.viewerOptions.baseDiv
    }

    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry)

        // Register model manipulation commands
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        if (this.viewerOptions.boundsComputation == 'dynamic') {
            registry.register(ComputedBoundsAction.KIND, this)
        }
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
                this.storeNewModel(object.action)
            }
        } else {
            this.logger.error(this, 'received data is not an action message', object)
        }
    }

    protected storeNewModel(action: Action) {
        if(action.kind == SetModelCommand.KIND || action.kind == UpdateModelCommand.KIND) {
            const newRoot = (action as any)['newRoot']
            if(newRoot)
                this.storage.store(newRoot as SModelRootSchema)
        }
    }
}
