import {
    ActionHandlerRegistry, IActionHandler,
    IActionHandlerInitializer
} from "../../base/actions/action-handler"
import { Action } from "../../base/actions/action"
import { ICommand } from "../../base/commands/command"
import { injectable } from "inversify"
import {
    ActivateEditModeCommand, SetControlPointsAction
} from "./edit"
import { MoveCommand } from "../move/move"

class SetControlPointsActionHandler implements IActionHandler {
    handle(action: Action): ICommand | Action | void {
        return new SetControlPointsAction()
    }

}

@injectable()
export class EditActionHandlerInitializer implements IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void {
        const setControlPointsActionHandler = new SetControlPointsActionHandler()
        registry.register(ActivateEditModeCommand.KIND, setControlPointsActionHandler)
        registry.register(MoveCommand.KIND, setControlPointsActionHandler)
    }

}