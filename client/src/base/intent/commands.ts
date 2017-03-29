import { SModelRoot } from "../model/smodel"
import { IModelFactory } from "../model/smodel-factory"
import { IViewer } from "../view/viewer"
import {ILogger} from "../../utils/logging"
import {AnimationFrameSyncer} from "../animations/animation-frame-syncer"
import { ActionHandler, Action } from "./actions"

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

    isPushable(): boolean
}

export abstract class AbstractCommand implements Command {
    abstract execute(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    abstract undo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    abstract redo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean {
        return false
    }

    isPushable(): boolean {
        return true
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
    constructor(private commandType: new (Action) => Command) {
    }

    handle(action: Action): Command | Action | undefined {
        return new this.commandType(action)
    }
}
