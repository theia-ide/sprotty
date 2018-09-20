/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Command, CommandExecutionContext, CommandResult } from "../../base/commands/command";
import { Action } from "../../base/actions/action";
import { SModelElement, SParentElement, SChildElement } from "../../base/model/smodel";

export const deletableFeature = Symbol('deletableFeature');

export interface Deletable {
}

export function isDeletable<T extends SModelElement>(element: T): element is T & Deletable & SChildElement {
    return element instanceof SChildElement && element.hasFeature(deletableFeature);
}

export class DeleteElementAction implements Action {
    kind = DeleteElementCommand.KIND;

    constructor(readonly elementIds: string[]) {}
}

export class ResolvedDelete {
    child: SChildElement;
    parent: SParentElement;
}

export class DeleteElementCommand extends Command {
    static readonly KIND = 'delete';

    resolvedDeletes: ResolvedDelete[] = [];

    constructor(readonly action: DeleteElementAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandResult {
        const index = context.root.index;
        for (let id of this.action.elementIds) {
            const element = index.getById(id);
            if (element && isDeletable(element)) {
                this.resolvedDeletes.push({ child: element, parent: element.parent });
                element.parent.remove(element);
            }
        }
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandResult {
        for (let resolvedDelete of this.resolvedDeletes)
            resolvedDelete.parent.add(resolvedDelete.child);
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandResult {
        for (let resolvedDelete of this.resolvedDeletes)
            resolvedDelete.parent.add(resolvedDelete.child);
        return context.root;
    }
}