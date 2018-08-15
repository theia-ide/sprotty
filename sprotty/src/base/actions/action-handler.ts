/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, multiInject, optional } from "inversify";
import { TYPES } from "../types";
import { MultiInstanceRegistry } from "../../utils/registry";
import { CommandActionHandler, ICommand, ICommandFactory } from "../commands/command";
import { Action } from "./action";

/**
 * An action handler accepts an action and reacts to it by returning either a command to be
 * executed, or another action to be dispatched.
 */
export interface IActionHandler {
    handle(action: Action): ICommand | Action | void
}

/**
 * Initializes and registers action handlers.
 */
export interface IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void
}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
@injectable()
export class ActionHandlerRegistry extends MultiInstanceRegistry<IActionHandler> {

    constructor(@multiInject(TYPES.IActionHandlerInitializer) @optional() initializers: (IActionHandlerInitializer)[]) {
        super();

        initializers.forEach(
            initializer => this.initializeActionHandler(initializer)
        );
    }

    registerCommand(commandType: ICommandFactory): void {
        this.register(commandType.KIND, new CommandActionHandler(commandType));
    }

    initializeActionHandler(initializer: IActionHandlerInitializer): void {
        initializer.initialize(this);
    }
}
