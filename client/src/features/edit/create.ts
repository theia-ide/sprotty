/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Action } from "../../base/actions/action";
import { Command, CommandExecutionContext, CommandResult } from "../../base/commands/command";
import { SParentElement, SChildElement } from "../../base/model/smodel";
import { SEdgeSchema } from "../../graph/sgraph";

export class CreateElementAction implements Action {
    readonly kind = CreateElementCommand.KIND;

    constructor(readonly containerId: string, readonly edgeSchema: SEdgeSchema) {}
}

export class CreateElementCommand extends Command {
    static readonly KIND = "createElement";

    container: SParentElement;
    newElement: SChildElement;

    constructor(readonly action: CreateElementAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandResult {
        const container = context.root.index.getById(this.action.containerId);
        if (container instanceof SParentElement) {
            this.container = container;
            this.newElement = context.modelFactory.createElement(this.action.edgeSchema);
            this.container.add(this.newElement);
        }
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandResult {
        this.container.remove(this.newElement);
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandResult {
        this.container.add(this.newElement);
        return context.root;
    }
}
