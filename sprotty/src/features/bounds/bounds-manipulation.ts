/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, Point } from "../../utils/geometry";
import { SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel";
import { Action } from "../../base/actions/action";
import { CommandExecutionContext, HiddenCommand, SystemCommand } from "../../base/commands/command";
import { BoundsAware, isBoundsAware, Alignable } from './model';

/**
 * Sent from the model source (e.g. a DiagramServer) to the client to update the bounds of some
 * (or all) model elements.
 */
export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND;

    constructor(public readonly bounds: ElementAndBounds[]) {
    }
}

/**
 * Sent from the model source to the client to request bounds for the given model. The model is
 * rendered invisibly so the bounds can derived from the DOM. The response is a ComputedBoundsAction.
 * This hidden rendering round-trip is necessary if the client is responsible for parts of the layout
 * (see `needsClientLayout` viewer option).
 */
export class RequestBoundsAction implements Action {
    readonly kind = RequestBoundsCommand.KIND;

    constructor(public readonly newRoot: SModelRootSchema) {
    }
}

/**
 * Sent from the client to the model source (e.g. a DiagramServer) to transmit the result of bounds
 * computation as a response to a RequestBoundsAction. If the server is responsible for parts of
 * the layout (see `needsServerLayout` viewer option), it can do so after applying the computed bounds
 * received with this action. Otherwise there is no need to send the computed bounds to the server,
 * so they can be processed locally by the client.
 */
export class ComputedBoundsAction implements Action {
    static readonly KIND = 'computedBounds';

    readonly kind = ComputedBoundsAction.KIND;

    constructor(public readonly bounds: ElementAndBounds[],
                public readonly revision?: number,
                public readonly alignments?: ElementAndAlignment[]) {
    }
}

/**
 * Associates new bounds with a model element, which is referenced via its id.
 */
export interface ElementAndBounds {
    elementId: string
    newBounds: Bounds
}

/**
 * Associates a new alignment with a model element, which is referenced via its id.
 */
export interface ElementAndAlignment {
    elementId: string
    newAlignment: Point
}

export interface ResolvedElementAndBounds {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    newBounds: Bounds
}

export interface ResolvedElementAndAlignment {
    element: SModelElement & Alignable
    oldAlignment: Point
    newAlignment: Point
}

export class SetBoundsCommand extends SystemCommand {
    static readonly KIND: string  = 'setBounds';

    protected bounds: ResolvedElementAndBounds[] = [];

    constructor(protected action: SetBoundsAction) {
        super();
    }

    execute(context: CommandExecutionContext) {
        this.action.bounds.forEach(
            b => {
                const element = context.root.index.getById(b.elementId);
                if (element && isBoundsAware(element)) {
                    this.bounds.push({
                        element: element,
                        oldBounds: element.bounds,
                        newBounds: b.newBounds,
                    });
                }
            }
        );
        return this.redo(context);
    }

    undo(context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.bounds = b.oldBounds
        );
        return context.root;
    }

    redo(context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.bounds = b.newBounds
        );
        return context.root;
    }
}

export class RequestBoundsCommand extends HiddenCommand {
    static readonly KIND: string  = 'requestBounds';

    constructor(protected action: RequestBoundsAction) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRoot {
        return context.modelFactory.createRoot(this.action.newRoot);
    }

    get blockUntil(): (action: Action) => boolean {
        return action => action.kind === ComputedBoundsAction.KIND;
    }
}
