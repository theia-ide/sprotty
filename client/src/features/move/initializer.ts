/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify"
import { ActionHandlerRegistry, IActionHandler, IActionHandlerInitializer } from "../../base/actions/action-handler"
import { Action } from "../../base/actions/action"
import { ICommand } from "../../base/commands/command"
import { MoveAction, MoveCommand, MoveEdgesAction } from "./move"

class FindEdgesBetweenNodesHandler implements IActionHandler {
    handle(action: MoveAction): ICommand | Action | void {
        return new MoveEdgesAction(action)
    }
}

@injectable()
export class MoveActionHandlerInitializer implements IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void {
        const findEdgesBetweenNodesHandler = new FindEdgesBetweenNodesHandler()
        registry.register(MoveCommand.KIND, findEdgesBetweenNodesHandler)
    }
}