import { inject, injectable, optional } from "inversify"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { RedoAction, UndoAction } from "../../features/undo-redo/undo-redo"
import { IDiagramServer } from "../../remote/diagram-server"
import { Action, ActionHandlerRegistry, isAction } from "./actions"
import { ICommandStack } from "./command-stack"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"

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
    @inject(TYPES.IAnimationFrameSyncer) protected syncer: AnimationFrameSyncer

    constructor(@inject(TYPES.IDiagramServer) @optional() diagramServer: IDiagramServer) {
        if (diagramServer !== undefined) {
            diagramServer.onAction(action => {this.dispatch(action)})
        }
    }

    dispatchAll(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action): void {
        if (action.kind == UndoAction.KIND) {
            this.commandStack.undo()
        } else if (action.kind == RedoAction.KIND) {
            this.commandStack.redo()
        } else {
            this.handleAction(action)
        }
    }

    protected handleAction(action: Action): void {
        this.logger.log(this, 'handle', action)
        const handlers = this.actionHandlerRegistry.get(action.kind)
        if (handlers.length > 0) {
            for (let handler of handlers) {
                const result = handler.handle(action)
                if (isAction(result))
                    this.dispatch(result)
                else if (result !== undefined)
                    this.commandStack.execute(result)
            }
        } else {
            this.logger.warn(this, 'missing handler for action', action)
        }
    }
}

