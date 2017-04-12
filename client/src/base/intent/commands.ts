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
    execute(context: CommandExecutionContext): CommandResult

    undo(context: CommandExecutionContext): CommandResult

    redo(context: CommandExecutionContext): CommandResult

    merge(command: Command, context: CommandExecutionContext): boolean
}

export type CommandResult = SModelRoot | Promise<SModelRoot>

export interface CommandFactory {
    KIND: string
    new (a: Action): Command
}

export abstract class AbstractCommand implements Command {

    abstract execute(context: CommandExecutionContext): CommandResult

    abstract undo(context: CommandExecutionContext): CommandResult

    abstract redo(context: CommandExecutionContext): CommandResult

    merge(command: Command, context: CommandExecutionContext): boolean {
        return false
    }
}

export abstract class AbstractHiddenCommand extends AbstractCommand {
    abstract execute(context: CommandExecutionContext): SModelRoot

    undo(context: CommandExecutionContext): CommandResult {
        context.logger.error(this, 'Cannot undo a hidden command')
        return context.root
    }

    redo(context: CommandExecutionContext): CommandResult {
        context.logger.error(this, 'Cannot redo a hidden command')
        return context.root
    }
}

export abstract class AbstractSystemCommand extends AbstractCommand {
}

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
