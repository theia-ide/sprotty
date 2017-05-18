/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { BoundsAware, isBoundsAware } from './model';
import { Bounds } from "../../utils/geometry"
import { SModelElement, SModelRoot, SModelRootSchema } from "../../base/model/smodel"
import { Action, ModelAction } from "../../base/intent/actions"
import { CommandExecutionContext, HiddenCommand, SystemCommand } from "../../base/intent/commands"

export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND

    constructor(public bounds: ElementAndBounds[]) {
    }
}

export class RequestBoundsAction implements Action {
    readonly kind = RequestBoundsCommand.KIND

    constructor(public newRoot: SModelRootSchema) {
    }
}

export class ComputedBoundsAction implements ModelAction {
    static readonly KIND = 'computedBounds'
    
    readonly kind = ComputedBoundsAction.KIND

    constructor(public bounds: ElementAndBounds[], public modelType: string, public modelId: string) {
    }
}

export interface ElementAndBounds {
    elementId: string
    newBounds: Bounds
}

interface ResolvedElementAndBounds {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    newBounds: Bounds
}

export class SetBoundsCommand extends SystemCommand {
    static readonly KIND: string  = 'setBounds'

    protected bounds: ResolvedElementAndBounds[] = []
    
    constructor(protected action: SetBoundsAction) {
        super()
    }

    execute(context: CommandExecutionContext) {
        this.action.bounds.forEach(
            b => {
                const element = context.root.index.getById(b.elementId)
                if (element && isBoundsAware(element)) {
                    this.bounds.push({
                        element: element,
                        oldBounds: element.bounds,
                        newBounds: b.newBounds,
                    })
                }
            }
        )
        return this.redo(context)
    }

    undo(context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.bounds = b.oldBounds
        )
        return context.root
    }

    redo(context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.bounds = b.newBounds
        )
        return context.root
    }
}

export class RequestBoundsCommand extends HiddenCommand {
    static readonly KIND: string  = 'requestBounds'
    
    constructor(protected action: RequestBoundsAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        return context.modelFactory.createRoot(this.action.newRoot)
    }

    get blockUntilActionKind() {
        return ComputedBoundsAction.KIND
    }
}
