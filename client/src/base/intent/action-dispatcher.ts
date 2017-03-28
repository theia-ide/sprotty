import "reflect-metadata"
import { injectable, inject } from "inversify"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { UndoAction, RedoAction } from "../../features/undo-redo/undo-redo"
import { Action, ActionHandlerRegistry } from "./actions"
import { ICommandStack } from "./command-stack"
import {AnimationFrameSyncer} from "../animations/animation-frame-syncer"

export interface IActionDispatcher {
    dispatch(action: Action): void
    dispatchAll(actions: Action[]): void
    dispatchNextFrame(action: Action): void
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

    nextFrameActions:Action[] = []

    dispatchNextFrame(action: Action) {
        const trigger = this.nextFrameActions.length === 0
        this.nextFrameActions.push(action)
        if(trigger) {
            this.syncer.onNextFrame(() => {
                const allActions = this.nextFrameActions
                this.nextFrameActions = []
                this.dispatchAll(allActions)
            })
        }
    }

    dispatchAll(actions: Action[]): void {
        actions.forEach(action => this.dispatch(action))
    }

    dispatch(action: Action): void {
        if(this.nextFrameActions.length > 0) {
            this.dispatchNextFrame(action)
            return
        }
        if (action.kind == UndoAction.KIND) {
            this.commandStack.undo()
        } else if (action.kind == RedoAction.KIND) {
            this.commandStack.redo()
        } else {
            const result = this.handleAction(action)
            if (result) {
                if (result.commands)
                    this.commandStack.execute(result.commands)
                if (result.actions)
                    this.dispatchAll(result.actions)
            }
        }
    }

    protected handleAction(action: Action) {
        this.logger.log('ActionDispatcher: handle', action)
        if(this.actionHandlerRegistry.hasKey(action.kind)) {
            const actionHandler = this.actionHandlerRegistry.get(action.kind)
            return actionHandler.handle(action)
        } else {
            this.logger.warn('ActionDispatcher: missing command for action', action)
            return undefined
        }
    }
}

