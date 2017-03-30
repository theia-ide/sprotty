import { injectable, inject, multiInject, optional } from "inversify"
import { MultiInstanceRegistry } from "../../utils/registry"
import { ILogger } from "../../utils/logging"
import { IDiagramServer, ServerActionHandler } from "../../remote/diagram-server"
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
    handle(action: Action): Command | Action | undefined
}

export class TranslatingActionHandler implements ActionHandler {
    constructor(private translator: (a: Action) => Action) {
    }

    handle(action: Action): Command | Action | undefined {
        return this.translator(action)
    }
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends MultiInstanceRegistry<ActionHandler> {

    constructor(
        @multiInject(TYPES.ICommand) @optional() commandCtrs: (CommandFactory)[],
        @inject(TYPES.ILogger) protected logger: ILogger,
        @inject(TYPES.IDiagramServer) @optional() protected diagramServer?: IDiagramServer
    ) {
        super()
        commandCtrs.forEach(
            commandCtr => this.registerCommand(commandCtr)
        )
    }

    registerCommand(commandType: CommandFactory): void {
        this.register(commandType.KIND, new CommandActionHandler(commandType))
    }

    registerServerMessage(kind: string): void {
        if (this.diagramServer !== undefined)
            this.register(kind, new ServerActionHandler(this.diagramServer))
        else
            this.logger.error(this, 'No implementation of IDiagramServer has been configured.')
    }

    registerTranslator(kind: string, translator: (a: Action) => Action): void {
        this.register(kind, new TranslatingActionHandler(translator))
    }
}
