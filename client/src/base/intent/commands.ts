import { SModelRoot } from "../model/smodel"
import { IModelFactory } from "../model/smodel-factory"
import { IViewer } from "../view/viewer"
import { ILogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"
import { Action, ActionHandler } from "./actions"

/**
 * A command holds the behaviour of an action.
 * It is executed on a command stack and can be undone / redone.
 *
 * Each command should define a static string property KIND that matches the associated action.
 */
export interface Command {
    execute(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    undo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    redo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean

    isSystemCommand(): boolean

    isHiddenCommand(): boolean
}

export interface CommandFactory {
    KIND: string
    new (a: Action): Command
}

export abstract class AbstractCommand implements Command {
    abstract execute(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    abstract undo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    abstract redo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean {
        return false
    }

    isSystemCommand(): boolean {
        return false
    }

    isHiddenCommand(): boolean {
        return false
    }
}

export type SModelRootOrPromise = SModelRoot | Promise<SModelRoot>

export interface CommandExecutionContext {
    root: SModelRoot
    modelFactory: IModelFactory
    modelChanged: IViewer
    duration: number
    logger: ILogger
    syncer: AnimationFrameSyncer
}

export class CommandActionHandler implements ActionHandler {
    constructor(private commandType: new (a: Action) => Command) {
    }

    handle(action: Action): Command | Action | undefined {
        return new this.commandType(action)
    }
}
