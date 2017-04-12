import { HiddenBoundsUpdater } from '../../features/bounds/bounds-updater';
import { inject, injectable } from "inversify"
import {
    AbstractHiddenCommand,
    Command,
    CommandExecutionContext,
    CommandResult
} from './commands';
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

interface CommandStackState {
    root: SModelRoot,
    hiddenRoot: SModelRoot | undefined
}

/**
 * The component that holds the model and applies the commands to change it.
 */
@injectable()
export class CommandStack implements ICommandStack {

    defaultDuration = 250

    @inject(TYPES.IModelFactory) protected modelFactory: IModelFactory
    @inject(TYPES.IViewerProvider) protected viewerProvider: IViewerProvider
    @inject(TYPES.ILogger) protected logger: ILogger
    @inject(TYPES.IAnimationFrameSyncer) protected syncer: AnimationFrameSyncer

    protected currentPromise: Promise<CommandStackState> = Promise.resolve({root: EMPTY_ROOT})

    protected viewer: IViewer
    protected undoStack: Command[] = []
    protected redoStack: Command[] = []
    protected offStack: Command[] = []

    executeAll(commands: Command[]): Promise<SModelRoot> {
        commands.forEach(
            command => {
                this.logger.log(this, 'Executing', command)
                this.handleCommand(command, command.execute, this.mergeOrPush)
            }
        )
        return this.thenUpdate()
    }

    execute(command: Command): Promise<SModelRoot> {
        this.logger.log(this, 'Executing', command)
        this.handleCommand(command, command.execute, this.mergeOrPush)
        return this.thenUpdate()
    }

    undo() : Promise<SModelRoot>  {
        this.undoOffStackSystemCommands()
        this.undoPreceedingSystemCommands()
        const command = this.undoStack.pop()
        if(command !== undefined) {
            this.logger.log(this, 'Undoing', command)
            this.handleCommand(command, command.undo, (command: Command, context: CommandExecutionContext) => {
                this.redoStack.push(command)
            })
        }
        return this.thenUpdate()
    }

    redo() : Promise<SModelRoot> {
        this.undoOffStackSystemCommands()
        const command = this.redoStack.pop()
        if(command !== undefined) {
            this.logger.log(this, 'Redoing', command)
            this.handleCommand(command, command.redo, (command: Command, context: CommandExecutionContext) => {
                this.undoStack.push(command)
            })
        }
        this.redoFollowingSystemCommands()
        return this.thenUpdate()
    }

    protected handleCommand(command: Command,
                            operation: (context: CommandExecutionContext)=>CommandResult,
                            beforeResolve: (command: Command, context: CommandExecutionContext)=>void) {
        this.currentPromise = this.currentPromise.then(
            state => {
                let newHiddenRoot: SModelRoot | undefined = undefined
                const promise = new Promise(
                    (resolve: (result: CommandStackState) => void, reject: (result: CommandStackState) => void) => {
                        const context = this.createContext(state.root)
                        const newResult = operation.call(command, context) as CommandResult
                        if(command instanceof AbstractHiddenCommand) {
                            resolve({
                                root: state.root,
                                hiddenRoot: newResult as SModelRoot
                            }) 
                        } else if (newResult instanceof Promise) {
                            newResult.then(
                                (newModel: SModelRoot) => {
                                    beforeResolve.call(this, command, context)
                                    resolve({
                                        root: newModel,
                                        hiddenRoot: state.hiddenRoot
                                    })
                                }
                            )
                        } else {
                            beforeResolve.call(this, command, context)
                            resolve({
                                root: newResult,
                                hiddenRoot: state.hiddenRoot
                            })
                        }
                    })
                return promise
            })
    }

    protected thenUpdate() {
        this.currentPromise = this.currentPromise.then(
            state => {
                if (state.hiddenRoot !== undefined) 
                    this.updateHidden(state.hiddenRoot)
                if(state.root)
                    this.update(state.root)
                return { root: state.root }
            }
        )
        return this.currentPromise.then(
            state => state.root
        )
    }

    protected mergeOrPush(command: Command, context: CommandExecutionContext) {
        if(command instanceof AbstractHiddenCommand)
            return;
        if(command.isSystemCommand() && this.redoStack.length > 0) {
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

    protected undoOffStackSystemCommands() {
        let command = this.offStack.pop()
        while(command !== undefined) {
            this.logger.log(this, 'Undoing off-stack', command)
            this.handleCommand(command, command.undo, () => {})
            command = this.offStack.pop()
        }
    }

    protected undoPreceedingSystemCommands() {
        let command = this.undoStack[this.undoStack.length - 1]
        while(command !== undefined && command.isSystemCommand()) {
            this.undoStack.pop()
            this.logger.log(this, 'Undoing', command)
            this.handleCommand(command, command.undo, (command: Command, context: CommandExecutionContext) => {
                this.redoStack.push(command)
            })
            command = this.undoStack[this.undoStack.length - 1]
        }
    }

    protected redoFollowingSystemCommands() {
        let command = this.redoStack[this.redoStack.length -1]
        while (command !== undefined && command.isSystemCommand()) {
            this.redoStack.pop()
            this.logger.log(this, 'Redoing ', command)
            this.handleCommand(command, command.redo, (command: Command, context: CommandExecutionContext) => {
                this.undoStack.push(command)
            })
            command = this.redoStack[this.redoStack.length -1]
        }
    }

    update(model: SModelRoot): void {
        if(this.viewer) {
            this.viewer.update(model)
            return
        }
        this.viewerProvider().then(viewer => {
            this.viewer = viewer
            this.update(model)
        })
    }

    updateHidden(model: SModelRoot): void {
        if(this.viewer) {
            this.viewer.updateHidden(model)
            return
        }
        this.viewerProvider().then(viewer => {
            this.viewer = viewer
            this.updateHidden(model)
        })
    }

    protected createContext(model: SModelRoot) : CommandExecutionContext {
        const context: CommandExecutionContext = {
            root: model,
            modelChanged: this,
            modelFactory: this.modelFactory,
            duration: this.defaultDuration,
            logger: this.logger,
            syncer: this.syncer
        }
        return context
    }
}

export type CommandStackProvider = () => Promise<CommandStack>


