import "reflect-metadata"
import {injectable, inject} from "inversify"
import {TYPES} from "../types"
import {InstanceRegistry} from "../../utils"
import {Command, CommandActionHandler} from "./commands"
import {SetModelAction, SetModelCommand} from "../behaviors/model-manipulation"
import { RequestActionHandlerFactory, NotificationActionHandlerFactory } from "./server-action-handlers"
import { IActionDispatcher } from "./action-dispatcher"

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export interface IActionHandler {
    handle(action: Action): Command[]
}

export abstract class TranslateActionHandler implements IActionHandler {
    constructor(protected actionDispatcher: IActionDispatcher,
                protected immediateHandler?: IActionHandler) {
    }

    handle(action: Action): Command[] {
        const translatedActions = this.translate(action)
        if (translatedActions.length > 0)
            this.actionDispatcher.dispatchAll(translatedActions)
        if (this.immediateHandler)
            return this.immediateHandler.handle(action)
        else
            return [];
    }

    protected abstract translate(action: Action): Action[]
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends InstanceRegistry<IActionHandler> {

    @inject(TYPES.RequestActionHandlerFactory) protected requestActionHandlerFactory: RequestActionHandlerFactory
    @inject(TYPES.NotificationActionHandlerFactory) protected notificationActionHandlerFactory: NotificationActionHandlerFactory

    constructor() {
        super()
        this.registerDefaults()
    }

    protected registerDefaults() {
        this.registerCommand(SetModelAction.KIND, SetModelCommand)
    }

    registerCommand(kind: string, commandType: new (Action) => Command) {
        this.register(kind, new CommandActionHandler(commandType))
    }

    registerServerRequest(kind: string, immediateHandler?: IActionHandler) {
        const handler = this.requestActionHandlerFactory(immediateHandler)
        this.register(kind, handler)
    }

    registerServerNotification(kind: string, immediateHandler?: IActionHandler) {
        const handler = this.notificationActionHandlerFactory(immediateHandler)
        this.register(kind, handler)
    }
}

