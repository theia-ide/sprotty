import "reflect-metadata"
import {injectable, inject} from "inversify"
import {TYPES} from "../types"
import {ILogger} from "../../utils"
import {Action, ActionHandlerRegistry} from "./actions"
import {ICommandStack} from "./command-stack"
import {UndoAction, RedoAction} from "../../features/undo-redo/undo-redo"
import {Command} from "./commands"

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

    nextFrameActions: Action[] = []
    thisFrameActions: Action[] = []

    constructor() {
        if(typeof window !== 'undefined')
            this.nextFrame()
    }

    protected nextFrame() {
        if(this.thisFrameActions.length > 0)
            this.doDispatch(this.thisFrameActions)
        this.thisFrameActions = this.nextFrameActions
        this.nextFrameActions = []
        window.requestAnimationFrame(() => this.nextFrame())
    }

    dispatchNextFrame(action: Action) {
        this.nextFrameActions.push(action)
    }

    dispatchAll(actions: Action[]): void {
        this.thisFrameActions = this.thisFrameActions.concat(actions)
    }

    dispatch(action: Action): void {
        this.thisFrameActions.push(action)
    }

    protected doDispatch(actions: Action[]) {
        let commands: Command[] = []
        let newActions: Action[] = []
        actions.forEach(
            action => {
                if (action.kind == UndoAction.KIND) {
                    this.commandStack.undo()
                } else if (action.kind == RedoAction.KIND) {
                    this.commandStack.redo()
                } else {
                    const result = this.handleAction(action)
                    if(result){
                        if (result.commands)
                            commands = commands.concat(result.commands)

                        if (result.actions && result.actions.length > 0)
                            newActions = newActions.concat(result.actions)
                    }
                }
            }
        )
        if(commands.length > 0)
            this.commandStack.execute(commands)
        if(newActions.length > 0)
            this.nextFrameActions = this.nextFrameActions.concat(newActions)
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

export type ActionDispatcherProvider = () => Promise<IActionDispatcher>
