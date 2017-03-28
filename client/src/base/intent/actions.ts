import "reflect-metadata"
import { injectable, inject, multiInject, optional } from "inversify"
import { InstanceRegistry } from "../../utils/utils"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { Command, CommandActionHandler } from "./commands"
import { ServerActionHandlerFactory } from "./server-action-handler"

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export function isAction(object?: any): object is Action {
    return object && object.hasOwnProperty('kind') && typeof(object['kind']) == 'string'
}

export interface ActionHandlerResult {
    actions?: Action[]
    commands?: Command[]
}

export interface ActionHandler {
    handle(action: Action): ActionHandlerResult
}

export function isActionHandler(object?: any): object is ActionHandler {
    return object && object.hasOwnProperty('handle') && typeof(object['handle']) == 'function'
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends InstanceRegistry<ActionHandler> {

    @inject(TYPES.ServerActionHandlerFactory) protected serverActionHandlerFactory: ServerActionHandlerFactory

    constructor(@multiInject(TYPES.ICommand) @optional() commandCtrs: (new (Action) => Command)[],
                @inject(TYPES.ILogger) protected logger: ILogger) {
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

    registerServerMessage(kind: string, immediate?: ActionHandler | (new (Action) => Command)) {
        const handler = this.serverActionHandlerFactory(this.toHandler(immediate))
        this.register(kind, handler)
    }

    protected toHandler(immediate?: ActionHandler | (new (Action) => Command)): ActionHandler | undefined {
        if (isActionHandler(immediate))
            return immediate
        else if (immediate !== undefined)
            return new CommandActionHandler(immediate)
        else
            return undefined
    }
}

