import "mocha"
import { ContainerModule, Container } from "inversify"
import { expect } from 'chai'
import { SModel } from "../model/smodel"
import { TYPES } from "../types"
import defaultModule from "../container-module"
import { UndoAction, RedoAction } from "../../features/undo-redo/undo-redo"
import { SetModelAction } from "../features/model-manipulation"
import { MoveAction, MoveCommand } from "../../features/move/move"
import { ICommandStack } from "./command-stack"
import { IActionDispatcher } from "./action-dispatcher"
import { ActionHandlerRegistry } from "./actions"

import EMPTY_ROOT = SModel.EMPTY_ROOT

describe('action dispatcher', () => {

    let execCount = 0
    let undoCount = 0
    let redoCount = 0

    const mockCommandStack: ICommandStack = {
        execute() { ++execCount },
        undo() { ++undoCount },
        redo() { ++redoCount }
    }

    const module = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ICommandStack).toConstantValue(mockCommandStack)
    })

    const container = new Container()
    container.load(defaultModule, module)

    const actionDispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)

    it('undo/redo/execute', () => {
        actionDispatcher.dispatch(new UndoAction)
        expect(execCount).to.be.equal(0)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(0)
    
        actionDispatcher.dispatch(new RedoAction)
        expect(execCount).to.be.equal(0)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    
        actionDispatcher.dispatch({kind: 'unknown'})
        expect(execCount).to.be.equal(0)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)

        // SetModelAction is registered by default
        actionDispatcher.dispatch(new SetModelAction(EMPTY_ROOT))
        expect(execCount).to.be.equal(1)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    
        // MoveAction is not registered by default
        actionDispatcher.dispatch(new MoveAction([], false))
        expect(execCount).to.be.equal(1)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)

        const registry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
        registry.registerCommand(MoveCommand)
    
        actionDispatcher.dispatch(new MoveAction([], false))
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    })
})