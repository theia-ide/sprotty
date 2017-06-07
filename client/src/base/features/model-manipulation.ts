/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { InitializeCanvasBoundsCommand } from './initialize-canvas'
import { injectable } from "inversify"
import { Action } from "../intent/actions"
import { isValidDimension } from "../../utils/geometry"
import { SModelRoot, SModelRootSchema } from "../model/smodel"
import { Command, CommandExecutionContext } from "../intent/commands"

export class SetModelAction implements Action {
    readonly kind = SetModelCommand.KIND

    constructor(public newRoot: SModelRootSchema, public isInitial: boolean = false) {
    }
}

@injectable()
export class SetModelCommand extends Command {
    static readonly KIND = 'setModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        this.oldRoot = context.root
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        if (isValidDimension(this.oldRoot.canvasBounds)) {
           this.newRoot.canvasBounds = this.oldRoot.canvasBounds
        }
        return this.newRoot
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return this.oldRoot
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return this.newRoot
    }

    get blockUntilActionKind() {
        if (this.action.isInitial)
            return InitializeCanvasBoundsCommand.KIND
        else
            return undefined
    }
}

export class RequestModelAction implements Action {
    static readonly KIND = 'requestModel'
    readonly kind = RequestModelAction.KIND

    constructor(public readonly options?: any) {
    }
}
