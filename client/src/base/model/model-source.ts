/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify"
import { Action, ActionHandlerRegistry, IActionHandler } from "../intent/actions"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { TYPES } from "../types"
import { ViewerOptions } from "../view/options"
import { RequestModelAction, SetModelCommand } from "../features/model-manipulation"
import { ICommand } from "../intent/commands"

/**
 * A model source is serving the model to the event cycle. It represents
 * the entry point to the client for external sources, such as model
 * editors.
 *
 * As an IActionHandler it listens to actions in and reacts to them with
 * commands or actions if necessary. This way, you can implement action
 * protocols between the client and the outside world.
 *
 * There are two default implementations for a ModelSource:
 * <ul>
 * <li>the LocalModelSource handles the actions to calculate bounds and
 * set/update the model</li>
 * <li>the DiagramServer connects via websocket to a remote source. It
 * can be used to connect to a model editor that provides the model,
 * layouts diagrams, transfers selection and answers model queries from
 * the client.</li>
 */
@injectable()
export abstract class ModelSource implements IActionHandler {

    protected actionDispatcher: IActionDispatcher

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions) {
        this.initialize(actionHandlerRegistry)
        this.actionDispatcher = actionDispatcher
    }

    initialize(registry: ActionHandlerRegistry): void {
        // Register model manipulation commands
        registry.registerCommand(SetModelCommand)

        // Register this model source
        registry.register(RequestModelAction.KIND, this)
    }

    abstract handle(action: Action): ICommand | Action | void
}
