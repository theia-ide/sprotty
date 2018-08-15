/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { TYPES } from "../base/types";
import { Action } from "../base/actions/action";
import { ActionHandlerRegistry, IActionHandler } from "../base/actions/action-handler";
import { IActionDispatcher } from "../base/actions/action-dispatcher";
import { ViewerOptions } from "../base/views/viewer-options";
import { RequestModelAction, SetModelCommand } from "../base/features/set-model";
import { ICommand } from "../base/commands/command";
import { ExportSvgAction } from '../features/export/svg-exporter';

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

    constructor(@inject(TYPES.IActionDispatcher) readonly actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions) {
        this.initialize(actionHandlerRegistry);
    }

    protected initialize(registry: ActionHandlerRegistry): void {
        // Register model manipulation commands
        registry.registerCommand(SetModelCommand);

        // Register this model source
        registry.register(RequestModelAction.KIND, this);
        registry.register(ExportSvgAction.KIND, this);
    }

    abstract handle(action: Action): ICommand | Action | void;
}
