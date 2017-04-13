import { EMPTY_BOUNDS } from '../../utils/geometry';
import { InitializeCanvasBoundsAction } from '../features/initialize-canvas';
import "reflect-metadata"
import "mocha"
import { Container, ContainerModule } from "inversify"
import { expect } from "chai"
import { TYPES } from "../types"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { RedoAction, UndoAction } from "../../features/undo-redo/undo-redo"
import { SetModelAction } from "../features/model-manipulation"
import { MoveAction, MoveCommand } from "../../features/move/move"
import { ICommandStack } from "./command-stack"
import { IActionDispatcher } from "./action-dispatcher"
import { ActionHandlerRegistry } from "./actions"
import defaultModule from "../di.config"

describe('action dispatcher', () => {

    let execCount = 0
    let undoCount = 0
    let redoCount = 0

    const promise = Promise.resolve(EMPTY_ROOT)

    const mockCommandStack: ICommandStack = {
        execute() { ++execCount; return promise },
        executeAll() { ++execCount; return promise },
        undo() { ++undoCount; return promise },
        redo() { ++redoCount; return promise }
    }

    const module = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ICommandStack).toConstantValue(mockCommandStack)
    })

    const container = new Container()
    container.load(defaultModule, module)

    const actionDispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)

    it('undo/redo/execute', () => {
        // an initial SetModelAciton is fired automatically
        expect(execCount).to.be.equal(1)
        expect(undoCount).to.be.equal(0)
        expect(redoCount).to.be.equal(0)

        // actions are postponed until InitializeCanvasBoundsAction comes in
        actionDispatcher.dispatch(new UndoAction)
        expect(execCount).to.be.equal(1)
        expect(undoCount).to.be.equal(0)
        expect(redoCount).to.be.equal(0)
    
        actionDispatcher.dispatch(new InitializeCanvasBoundsAction(EMPTY_BOUNDS))
        // postponed actions are fired as well
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(0)
    
        actionDispatcher.dispatch(new RedoAction)
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    
        actionDispatcher.dispatch({kind: 'unknown'})
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)

        // MoveAction is not registered by default
        actionDispatcher.dispatch(new MoveAction([], false))
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)

        const registry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
        registry.registerCommand(MoveCommand)
    
        actionDispatcher.dispatch(new MoveAction([], false))
        expect(execCount).to.be.equal(3)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    })
})