/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import 'reflect-metadata'
import 'mocha'
import { expect } from "chai"
import { Container } from "inversify"
import { TYPES } from "../types"
import { EMPTY_BOUNDS } from '../../utils/geometry'
import { InitializeCanvasBoundsAction } from '../features/initialize-canvas'
import { RedoAction, UndoAction } from "../../features/undo-redo/undo-redo"
import { Command, CommandExecutionContext, CommandResult, ICommand } from '../commands/command'
import { ICommandStack } from "../commands/command-stack"
import { IActionDispatcher } from "./action-dispatcher"
import { ActionHandlerRegistry } from "./action-handler"
import { Action } from "./action"
import defaultModule from "../di.config"

describe('ActionDispatcher', () => {

    let execCount = 0
    let undoCount = 0
    let redoCount = 0

    const mockCommandStack: ICommandStack = {
        execute(command: ICommand) {
            ++execCount
            return null!
        },
        executeAll(commands: ICommand[]) {
            ++execCount
            return null!
        },
        undo() {
            ++undoCount
            return null!
        },
        redo() {
            ++redoCount
            return null!
        }
    }

    const container = new Container()
    container.load(defaultModule)
    container.rebind(TYPES.ICommandStack).toConstantValue(mockCommandStack)

    const actionDispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)

    class MockCommand extends Command {
        static KIND = 'mock'

        execute(context: CommandExecutionContext): CommandResult {
            return context.root
        }

        undo(context: CommandExecutionContext): CommandResult {
            return context.root
        }

        redo(context: CommandExecutionContext): CommandResult {
            return context.root
        }
    }

    class MockAction implements Action {
        kind = MockCommand.KIND
    }

    it('undo/redo/execute', () => {
        // an initial SetModelAction is fired automatically
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
        actionDispatcher.dispatch(new MockAction())
        expect(execCount).to.be.equal(2)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)

        const registry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
        registry.registerCommand(MockCommand)

        actionDispatcher.dispatch(new MockAction())
        expect(execCount).to.be.equal(3)
        expect(undoCount).to.be.equal(1)
        expect(redoCount).to.be.equal(1)
    })
})