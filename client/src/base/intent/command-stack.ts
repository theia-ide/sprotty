import {DispatcherCallback} from "./action-dispatcher"
import {Command, CommandExecutionContext} from "./commands"
import {SModelRoot, SModel} from "../model"
import {EventSource} from "../../utils"

/**
 * The component that holds the model and applies the commands to change it.
 */
export class CommandStack extends EventSource<CommandStackCallback> implements DispatcherCallback, CommandStackCallback {

    defaultDuration = 250

    currentPromise: Promise<SModelRoot> = Promise.resolve(SModel.EMPTY_ROOT)

    undoStack: Command[] = []
    redoStack: Command[] = []

    execute(commands: Command[]): void {
        commands.forEach(
            (command) => {
                this.currentPromise = this.currentPromise.then(
                    model => {
                        return new Promise(
                            (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
                                const context: CommandExecutionContext = {
                                    modelChanged: this,
                                    duration: this.defaultDuration,
                                    root: model
                                }
                                const modelOrPromise = command.execute(model, context)
                                if (modelOrPromise instanceof Promise)
                                    modelOrPromise.then(
                                        newModel => {
                                            this.mergeOrPush(command, context)
                                            resolve(newModel)
                                        }
                                    )
                                else {
                                    this.mergeOrPush(command, context)
                                    resolve(modelOrPromise)
                                }
                            })
                    })
            }
        )
        this.currentPromise.then(
            model => this.update(model)
        )
    }

    private mergeOrPush(command: Command, context: CommandExecutionContext) {
        if (this.undoStack.length > 0) {
            const lastCommand = this.undoStack[this.undoStack.length - 1]
            if (!lastCommand.merge(command, context)) {
                this.undoStack.push(command)
            }
        } else {
            this.undoStack.push(command)
        }
        this.redoStack = []
    }

    undo() {
        this.currentPromise = this.currentPromise.then(
            model => {
                return new Promise(
                    (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
                        const command = this.undoStack.pop()
                        if (command === undefined) {
                            resolve(model)
                        } else {
                            const context: CommandExecutionContext = {
                                modelChanged: this,
                                duration: this.defaultDuration,
                                root: model
                            }
                            const modelOrPromise = command.undo(model, context)
                            if (modelOrPromise instanceof Promise)
                                modelOrPromise.then(
                                    newModel => {
                                        this.redoStack.push(command)
                                        resolve(newModel)
                                    }
                                )
                            else {
                                this.redoStack.push(command)
                                resolve(modelOrPromise)
                            }
                        }
                    })
            }
        )
        this.currentPromise.then(
            model => this.update(model)
        )
    }

    redo() {
        this.currentPromise = this.currentPromise.then(
            model => {
                return new Promise(
                    (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
                        const command = this.redoStack.pop()
                        if (command === undefined) {
                            resolve(model)
                        } else {
                            const context: CommandExecutionContext = {
                                modelChanged: this,
                                duration: this.defaultDuration,
                                root: model
                            }
                            const modelOrPromise = command.redo(model, context)
                            if (modelOrPromise instanceof Promise)
                                modelOrPromise.then(
                                    newModel => {
                                        this.undoStack.push(command)
                                        resolve(newModel)
                                    }
                                )
                            else {
                                this.undoStack.push(command)
                                resolve(modelOrPromise)
                            }
                        }
                    })
            }
        )
        this.currentPromise.then(
            model => this.update(model)
        )
    }

    update(model: SModelRoot) {
        this.callbacks.forEach((callback) => callback.update(model))
    }
}

export interface CommandStackCallback {
    update(model: SModelRoot): void
}