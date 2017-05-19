/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, multiInject, optional } from "inversify"
import { MultiInstanceRegistry } from "../../utils/registry"
import { TYPES } from "../types"
import { ICommand, CommandActionHandler, ICommandFactory } from "./commands"

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export function isAction(object?: any): object is Action {
    return object !== undefined && object.hasOwnProperty('kind') && typeof(object['kind']) === 'string'
}

/**
 * Actions that implement this interface can be related to a specific model.
 */
export interface ModelAction extends Action {
    modelType?: string
    modelId?: string
}

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
