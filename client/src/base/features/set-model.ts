/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify"
import { Action } from "../actions/action"
import { isValidDimension } from "../../utils/geometry"
import { SModelRoot, SModelRootSchema } from "../model/smodel"
import { Command, CommandExecutionContext } from "../commands/command"
import { InitializeCanvasBoundsCommand } from './initialize-canvas'

/**
 * Sent from the client to the model source (e.g. a DiagramServer) in order to request a model. Usually this
 * is the first message that is sent to the source, so it is also used to initiate the communication.
 * The response is a SetModelAction or an UpdateModelAction.
 */
export class RequestModelAction implements Action {
    static readonly KIND = 'requestModel'
    readonly kind = RequestModelAction.KIND

    constructor(public readonly options?: { [key: string]: string }) {
    }
}

/**
 * Sent from the model source to the client in order to set the model. If a model is already present, it is replaced.
 */
export class SetModelAction implements Action {
    readonly kind = SetModelCommand.KIND

    constructor(public readonly newRoot: SModelRootSchema,
                public readonly isInitial: boolean = false) {
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
        this.oldRoot = context.modelFactory.createRoot(context.root)
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        if (this.oldRoot.type === this.newRoot.type && isValidDimension(this.oldRoot.canvasBounds)) {
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
