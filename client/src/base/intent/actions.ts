import { inject, injectable, multiInject, optional } from "inversify"
import { MultiInstanceRegistry } from "../../utils/registry"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { Command, CommandActionHandler, CommandFactory } from "./commands"

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export function isAction(object?: any): object is Action {
    return object !== undefined && object.hasOwnProperty('kind') && typeof(object['kind']) == 'string'
}

export interface ActionHandler {
    handle(action: Action): Command | Action | void
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends MultiInstanceRegistry<ActionHandler> {

    constructor(
        @multiInject(TYPES.ICommand) @optional() commandCtrs: (CommandFactory)[],
        @inject(TYPES.ILogger) protected logger: ILogger,
    ) {
        super()
        commandCtrs.forEach(
            commandCtr => this.registerCommand(commandCtr)
        )
    }

    registerCommand(commandType: CommandFactory): void {
        this.register(commandType.KIND, new CommandActionHandler(commandType))
    }
}
