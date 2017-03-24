import "reflect-metadata"
import {injectable, inject, multiInject, optional} from "inversify"
import {TYPES} from "../types"
import {InstanceRegistry} from "../../utils"
import {Command, CommandActionHandler} from "./commands"
import {RequestActionHandlerFactory, NotificationActionHandlerFactory} from "./server-action-handlers"
import {Logger} from "../../utils/logging"

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export interface ActionHandlerResult {
    actions?: Action[]
    commands?: Command[]
}

export interface ActionHandler {
    handle(action: Action): ActionHandlerResult
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends InstanceRegistry<ActionHandler> {

    @inject(TYPES.RequestActionHandlerFactory) protected requestActionHandlerFactory: RequestActionHandlerFactory
    @inject(TYPES.NotificationActionHandlerFactory) protected notificationActionHandlerFactory: NotificationActionHandlerFactory

    constructor(@multiInject(TYPES.ICommand) @optional() commandCtrs: (new (Action) => Command)[],
                @inject(TYPES.Logger) protected logger: Logger) {
        super()
        commandCtrs.forEach(
            commandCtr => this.registerCommand(commandCtr)
        )
    }

    registerCommand(commandType: new (Action) => Command) {
        if (commandType.hasOwnProperty('KIND'))
            this.register(commandType['KIND'], new CommandActionHandler(commandType))
        else
            this.logger.error('Command ' + commandType.name + '  does not have a KIND property')
    }

    registerServerRequest(kind: string, immediateHandler?: ActionHandler) {
        const handler = this.requestActionHandlerFactory(immediateHandler)
        this.register(kind, handler)
    }

    registerServerNotification(kind: string, immediateHandler?: ActionHandler) {
        const handler = this.notificationActionHandlerFactory(immediateHandler)
        this.register(kind, handler)
    }
}

