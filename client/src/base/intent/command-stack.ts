import { inject, injectable } from "inversify"
import { Command, CommandExecutionContext, SModelRootOrPromise } from "./commands"
import { EMPTY_ROOT, IModelFactory } from "../model/smodel-factory"
import { IViewer, IViewerProvider } from "../view/viewer"
import { ILogger } from "../../utils/logging"
import { TYPES } from "../types"
import { SModelRoot } from "../model/smodel"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"

export interface ICommandStack {
    execute(command: Command): Promise<SModelRoot>
    executeAll(commands: Command[]): Promise<SModelRoot>
    undo(): Promise<SModelRoot>
    redo(): Promise<SModelRoot>
}

/**
 * The component that holds the model and applies the commands to change it.
 * 
 * The command stack is also in charge of correctly undoing and redoing commands. If needed,
 * commands will be merged (i.e move commands) as to not fill the undo/redo stacks with lots of smaller commands.
 * System commands are also handled differently by the command stack, as to not break the relation between the tops
 * of the undo and redo stacks.
 */
@injectable()
export class CommandStack implements ICommandStack {

    defaultDuration = 250

    @inject(TYPES.IModelFactory) protected modelFactory: IModelFactory
    @inject(TYPES.IViewerProvider) protected viewerProvider: IViewerProvider
    @inject(TYPES.ILogger) protected logger: ILogger
    @inject(TYPES.IAnimationFrameSyncer) protected syncer: AnimationFrameSyncer

    protected currentPromise: Promise<SModelRoot> = Promise.resolve(EMPTY_ROOT) // Last promise by a command
    protected viewer: IViewer
    protected undoStack: Command[] = [] // Contains the last called commands
    protected redoStack: Command[] = [] // Contains the last undo'ed commands
    protected offStack: Command[] = [] // Contains the system commands that needs to be undone to not break the chain between the tops of the redo/undo stacks.

    /**
     * Executes all the commands and returns a promise with the new model
     * @param commands - List of commands to execute
     */
    executeAll(commands: Command[]): Promise<SModelRoot> {
        commands.forEach(
            command => {
                this.logger.log(this, 'Executing', command)
                this.handleCommand(command, command.execute, this.mergeOrPush)
            }
        )
        return this.thenUpdate()
    }

    /**
     * Executes a command and returns a promise with the new model
     * @param command - Command to execute
     */
    execute(command: Command): Promise<SModelRoot> {
        this.logger.log(this, 'Executing', command)
        this.handleCommand(command, command.execute, this.mergeOrPush)
        return this.thenUpdate()
    }

    /**
     * Undo the last executed command and returns a promise with the new model
     * 
     * This will first undo the offStack system commands to make sure that the top of the undoStack can be applied to the current model.
     */
    undo(): Promise<SModelRoot> {
        this.undoOffStackSystemCommands()
        this.undoPreceedingSystemCommands()
        const command = this.undoStack.pop()
        if (command !== undefined) {
            this.logger.log(this, 'Undoing', command)
            this.handleCommand(command, command.undo, (command: Command, context: CommandExecutionContext) => {
                this.redoStack.push(command)
            })
        }
        return this.thenUpdate()
    }

    /**
     * Redo the last undo'ed command and returns a promise with the new model
     * 
     *  This will first undo the offStack system commands to make sure that the top of the redoStack can be applied to the current model.
     */
    redo(): Promise<SModelRoot> {
        this.undoOffStackSystemCommands()
        const command = this.redoStack.pop()
        if (command !== undefined) {
            this.logger.log(this, 'Redoing', command)
            this.handleCommand(command, command.redo, (command: Command, context: CommandExecutionContext) => {
                this.undoStack.push(command)
            })
        }
        this.redoFollowingSystemCommands()
        return this.thenUpdate()
    }

    /**
     * Handles the correct operation for a given command and context. A promise for the new model is then saved
     * internally to be sent to the viewer for update when done.
     *
     * @param command Command to call
     * @param operation Command operation to execute
     * @param beforeResolve Function to call before resolving the promise i.e push the command on the undoStack
     */
    protected handleCommand(command: Command,
        operation: (model: SModelRoot, context: CommandExecutionContext) => SModelRootOrPromise,
        beforeResolve: (command: Command, context: CommandExecutionContext) => void) {
        this.currentPromise = this.currentPromise.then(
            model => {
                return new Promise(
                    (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
                        const context = this.createContext(model)
                        const modelOrPromise = operation.call(command, model, context)
                        if (modelOrPromise instanceof Promise)
                            modelOrPromise.then(
                                newModel => {
                                    beforeResolve.call(this, command, context)
                                    resolve(newModel)
                                }
                            )
                        else {
                            beforeResolve.call(this, command, context)
                            resolve(modelOrPromise)
                        }
                    })
            })
    }

    /**
     * Pushes the command on the undoStack or merge the command with the last one if possible
     * 
     * For example, if an object is moved from point A to B, then to C, then to D, these commands will be merged so
     * that the last command that can be undone is the move from A to D only.
     * @param command Command to push on the stack or to merge with the last one
     * @param context Context used for the command (i.e logger, AnimationFrameSyncer, animation duration etc.)
     */
    protected mergeOrPush(command: Command, context: CommandExecutionContext) {
        if (command.isSystemCommand() && this.redoStack.length > 0) {
            this.offStack.push(command)
        } else {
            this.offStack.forEach(command => this.undoStack.push(command))
            this.offStack = []
            this.redoStack = []
            if (this.undoStack.length > 0) {
                const lastCommand = this.undoStack[this.undoStack.length - 1]
                if (lastCommand.merge(command, context))
                    return
            }
            this.undoStack.push(command)
        }
    }

    /**
     * Undo the system commands contained in the offStack
     */
    protected undoOffStackSystemCommands() {
        let command = this.offStack.pop()
        while (command !== undefined) {
            this.logger.log(this, 'Undoing off-stack', command)
            this.handleCommand(command, command.undo, () => { })
            command = this.offStack.pop()
        }
    }

    /**
     * Undo the preceding system commands that were previously pushed from the offStack to the undoStack. 
     * 
     * Necessary before undoing the last user command.
     */
    protected undoPreceedingSystemCommands() {
        let command = this.undoStack[this.undoStack.length - 1]
        while (command !== undefined && command.isSystemCommand()) {
            this.undoStack.pop()
            this.logger.log(this, 'Undoing', command)
            this.handleCommand(command, command.undo, (command: Command, context: CommandExecutionContext) => {
                this.redoStack.push(command)
            })
            command = this.undoStack[this.undoStack.length - 1]
        }
    }

    /**
     * Redo the following system commands that were previously pushed from the offStack to the redoStack. 
     * 
     * Necessary before redoing the next user command.
     */
    protected redoFollowingSystemCommands() {
        let command = this.redoStack[this.redoStack.length - 1]
        while (command !== undefined && command.isSystemCommand()) {
            this.redoStack.pop()
            this.logger.log(this, 'Redoing ', command)
            this.handleCommand(command, command.redo, (command: Command, context: CommandExecutionContext) => {
                this.undoStack.push(command)
            })
            command = this.redoStack[this.redoStack.length - 1]
        }
    }

    /**
     * Updates the viewer with a new updated model once the promise with the new model is done
     */
    protected thenUpdate() {
        this.currentPromise = this.currentPromise.then(
            model => {
                this.update(model)
                return model
            }
        )
        return this.currentPromise
    }

    /**
     * Provides the new updated view to the viewer and calls the update method
     * 
     * @param model Updated model send to the viewer
     */
    update(model: SModelRoot): void {
        if (this.viewer) {
            this.viewer.update(model)
            return
        }
        this.viewerProvider().then(viewer => {
            this.viewer = viewer
            this.update(model)
        })
    }

    /**
     * Creates the context that will be used in the command stack operations
     * 
     * @param model Root model for the command stack context
     */
    protected createContext(model: SModelRoot): CommandExecutionContext {
        const context: CommandExecutionContext = {
            modelChanged: this,
            modelFactory: this.modelFactory,
            duration: this.defaultDuration,
            root: model,
            logger: this.logger,
            syncer: this.syncer
        }
        return context
    }
}

export type CommandStackProvider = () => Promise<CommandStack>
