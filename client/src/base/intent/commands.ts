import {SModelRoot} from "../model"
import {SModelFactory} from "../model/smodel-factory"
import {IViewer} from "../view"
import { ActionHandler, Action, ActionHandlerResult } from "./actions"

/**
 * A command holds the behaviour of an action.
 * It is executed on a command stack and can be undone / redone.
 *
 * Each command should define a static string property KIND that matches the associated action.
 */
export interface Command {

    execute(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    undo(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    redo(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean

    isPushable(): boolean
}

export abstract class AbstractCommand {
    merge(command: Command, context: CommandExecutionContext): boolean {
        return false
    }

    isPushable(): boolean {
        return true
    }
}

type GModelRootOrPromise = SModelRoot | Promise<SModelRoot>

export interface CommandExecutionContext {
    root: SModelRoot
    modelFactory: SModelFactory
    modelChanged: IViewer
    duration: number
}

export class CommandActionHandler implements ActionHandler {

    constructor(private commandType: new (Action) => Command) {
    }

    handle(action: Action): ActionHandlerResult {
        return {
            commands: [new this.commandType(action)]
        }
    }

}
