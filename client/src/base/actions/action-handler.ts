/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, multiInject, optional } from "inversify"
import { TYPES } from "../types"
import { MultiInstanceRegistry } from "../../utils/registry"
import { ICommand, CommandActionHandler, ICommandFactory } from "../commands/command"
import { Action } from "./action"

export interface IActionHandler {
    handle(action: Action): ICommand | Action | void
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends MultiInstanceRegistry<IActionHandler> {

    constructor(@multiInject(TYPES.ICommand) @optional() commandCtrs: (ICommandFactory)[]) {
        super()
        commandCtrs.forEach(
            commandCtr => this.registerCommand(commandCtr)
        )
    }

    registerCommand(commandType: ICommandFactory): void {
        this.register(commandType.KIND, new CommandActionHandler(commandType))
    }
}
