import {
    ActionHandlerRegistry, IActionHandler,
    IActionHandlerInitializer
} from "../../base/actions/action-handler"
import { Action } from "../../base/actions/action"
import { ICommand } from "../../base/commands/command"
import { injectable } from "inversify"
import {
    ActivateEditModeCommand, MoveRoutingPointAction, MoveRoutingPointCommand, ShowRoutingPointsAction
} from "./edit"
import { MoveAction, MoveCommand } from "../move/move"

class ShowRoutingPointsActionHandler implements IActionHandler {
    handle(action: Action): ICommand | Action | void {
        return new ShowRoutingPointsAction(action)
    }
}

class MoveRoutingPointActionHandler implements IActionHandler {
    handle(action: Action): ICommand | Action | void {
        return new MoveRoutingPointAction((action as MoveAction).moves)
    }
}

@injectable()
export class EditActionHandlerInitializer implements IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void {
        const showRoutingPointsActionHandler = new ShowRoutingPointsActionHandler()
        registry.register(ActivateEditModeCommand.KIND, showRoutingPointsActionHandler)
        registry.register(MoveRoutingPointCommand.KIND, showRoutingPointsActionHandler)

        const moveRoutingPointActionHandler = new MoveRoutingPointActionHandler()
        registry.register(MoveCommand.KIND, moveRoutingPointActionHandler)
    }
}