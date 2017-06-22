import {
    ActionHandlerRegistry, IActionHandler,
    IActionHandlerInitializer
} from "../../base/actions/action-handler"
import { Action } from "../../base/actions/action"
import { ICommand } from "../../base/commands/command"
import { injectable } from "inversify"
import {
    ActivateEditModeCommand, MoveControlPointAction, MoveControlPointCommand, ShowControlPointsAction
} from "./edit"
import { MoveAction, MoveCommand } from "../move/move"

class ShowControlPointsActionHandler implements IActionHandler {
    handle(action: Action): ICommand | Action | void {
        return new ShowControlPointsAction(action)
    }
}

class MoveControlPointActionHandler implements IActionHandler {
    handle(action: Action): ICommand | Action | void {
        return new MoveControlPointAction((action as MoveAction).moves)
    }
}

@injectable()
export class EditActionHandlerInitializer implements IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void {
        const showControlPointsActionHandler = new ShowControlPointsActionHandler()
        registry.register(ActivateEditModeCommand.KIND, showControlPointsActionHandler)
        registry.register(MoveControlPointCommand.KIND, showControlPointsActionHandler)

        const moveControlPointActionHandler = new MoveControlPointActionHandler()
        registry.register(MoveCommand.KIND, moveControlPointActionHandler)
    }
}