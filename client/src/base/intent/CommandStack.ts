import {DispatcherCallback} from "./ActionDispatcher"
import {Command, CommandExecutionContext} from "./Commands"
import {GModelRoot, EMPTY_ROOT} from "../model/GModel"
import {EventSource} from "../../utils/Utils"

/**
 * The component that holds the model and applies the commands to change it.
 */
export class CommandStack extends EventSource<CommandStackCallback> implements DispatcherCallback, CommandStackCallback {

    defaultDuration = 250

    currentPromise: Promise<GModelRoot> = Promise.resolve(EMPTY_ROOT)

    undoStack: Command[] = []
    redoStack: Command[] = []

    execute(commands: Command[]): void {
        commands.forEach(
            (command) => {
                this.currentPromise = this.currentPromise.then(
                    model => {
                        return new Promise(
                            (resolve: (model: GModelRoot) => void, reject: (model: GModelRoot) => void) => {
                                const context: CommandExecutionContext = {
                                    modelChanged: this,
                                    duration: this.defaultDuration,
                                    root: model
                                }
                                const modelOrPromise = command.execute(model, context)
                                if (modelOrPromise instanceof Promise)
                                    modelOrPromise.then(
                                        newModel => {
                                            this.mergeOrPush(command)
                                            resolve(newModel)
                                        }
                                    )
                                else {
                                    this.mergeOrPush(command)
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

    private mergeOrPush(command: Command) {
        if (this.undoStack.length > 0) {
            const lastCommand = this.undoStack[this.undoStack.length - 1]
            if (!lastCommand.merge(command)) {
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
                    (resolve: (model: GModelRoot) => void, reject: (model: GModelRoot) => void) => {
                        if (this.undoStack.length == 0) {
                            resolve(model)
                        } else {
                            const command = this.undoStack.pop()
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
                    (resolve: (model: GModelRoot) => void, reject: (model: GModelRoot) => void) => {
                        if (this.redoStack.length == 0) {
                            resolve(model)
                        } else {
                            const command = this.redoStack.pop()
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

    update(model: GModelRoot) {
        this.callbacks.forEach((callback) => callback.update(model))
    }
}

export interface CommandStackCallback {
    update(model: GModelRoot): void
}