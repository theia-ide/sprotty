import "reflect-metadata"
import {injectable, inject, optional} from "inversify"
import {TYPES} from "../types"
import {ILogger} from "../../utils"
import { UndoAction, RedoAction } from "../../features"
import { IDiagramServer } from "../../remote"
import {Action, ActionHandlerRegistry} from "./actions"
import {ICommandStack} from "./command-stack"

export interface IActionDispatcher {
    dispatch(action: Action): void
    dispatchAll(actions: Action[]): void
}

/**
 * Collects actions, converts them to commands and dispatches them.
 */
@injectable()
export class ActionDispatcher implements IActionDispatcher {

    @inject(TYPES.ActionHandlerRegistry) protected actionHandlerRegistry: ActionHandlerRegistry
    @inject(TYPES.ICommandStack) protected commandStack: ICommandStack
    @inject(TYPES.ILogger) protected logger: ILogger

    constructor(@inject(TYPES.IDiagramServer) @optional() diagramServer?: IDiagramServer) {
        if (diagramServer) {
            diagramServer.onAction(action => {
                this.dispatch(action)
            })
        }
    }

    dispatchAll(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action): void {
        if (action.kind == UndoAction.KIND)
            this.commandStack.undo()
        else if (action.kind == RedoAction.KIND)
            this.commandStack.redo()
        else if (this.actionHandlerRegistry.hasKey(action.kind))
            this.handleAction(action)
        else
            this.logger.warn('ActionDispatcher: missing command for action', action)
    }

    protected handleAction(action: Action): void {
        this.logger.log('ActionDispatcher: handle', action)
        const actionHandler = this.actionHandlerRegistry.get(action.kind)
        const result = actionHandler.handle(action)
        if (result.commands && result.commands.length > 0) {
            this.commandStack.execute(result.commands)
        }
        if (result.actions && result.actions.length > 0) {
            this.dispatchAll(result.actions)
        }
    }

}

export type IActionDispatcherProvider = () => Promise<IActionDispatcher>
