/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import { Container, injectable } from "inversify"
import { LocalModelSource } from "./local-model-source"
import { ComputedBoundsAction, RequestBoundsAction } from "../features/bounds/bounds-manipulation"
import { IActionDispatcher } from "../base/intent/action-dispatcher"
import { Action } from "../base/intent/actions"
import { TYPES } from "../base/types"
import { ViewerOptions, overrideViewerOptions } from "../base/view/options"
import { SModelRootSchema } from "../base/model/smodel"
import { UpdateModelAction } from "../features/update/update-model"
import defaultContainerModule from "../base/di.config"

describe('LocalModelSource', () => {

    @injectable()
    class MockActionDispatcher implements IActionDispatcher {
        readonly actions: Action[] = []

        dispatchAll(actions: Action[]): void {
            for (const action of actions) {
                this.dispatch(action)
            }
        }

        dispatch(action: Action): void {
            this.actions.push(action)
        }
    }

    function setup(options: Partial<ViewerOptions>) {
        const container = new Container()
        container.load(defaultContainerModule)
        container.bind(TYPES.ModelSource).to(LocalModelSource)
        container.rebind(TYPES.IActionDispatcher).to(MockActionDispatcher).inSingletonScope()
        overrideViewerOptions(container, options)
        return container
    }

    it('sets the model in fixed mode', () => {
        const container = setup({ needsClientLayout: false })
        const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
        const dispatcher = container.get<MockActionDispatcher>(TYPES.IActionDispatcher)

        const root1: SModelRootSchema = {
            type: 'root',
            id: 'root'
        }
        modelSource.setModel(root1)
        const root2: SModelRootSchema = {
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'blob',
                    id: 'foo'
                }
            ]
        }
        modelSource.updateModel(root2)

        expect(dispatcher.actions).to.have.lengthOf(2)
        const action0 = dispatcher.actions[0] as RequestBoundsAction
        expect(action0).to.be.instanceOf(RequestBoundsAction)
        expect(action0.newRoot).to.equal(root1)
        const action1 = dispatcher.actions[1] as UpdateModelAction
        expect(action1).to.be.instanceOf(UpdateModelAction)
        expect(action1.newRoot).to.equal(root2)
    })

    it('requests bounds in dynamic mode', () => {
        const container = setup({ needsClientLayout: true })
        const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
        const dispatcher = container.get<MockActionDispatcher>(TYPES.IActionDispatcher)

        const root1: SModelRootSchema = {
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'node',
                    id: 'child1'
                }
            ]
        }
        modelSource.setModel(root1)
        modelSource.handle(new ComputedBoundsAction([
            {
                elementId: 'child1',
                newBounds: {
                    x: 10,
                    y: 10,
                    width: 20,
                    height: 20
                }
            }
        ]))
        const root2: SModelRootSchema = {
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'node',
                    id: 'bar'
                }
            ]
        }
        modelSource.updateModel(root2)

        expect(dispatcher.actions).to.have.lengthOf(3)
        const action0 = dispatcher.actions[0] as RequestBoundsAction
        expect(action0).to.be.instanceOf(RequestBoundsAction)
        expect(action0.newRoot).to.equal(root1)
        const action1 = dispatcher.actions[1] as UpdateModelAction
        expect(action1).to.be.instanceOf(UpdateModelAction)
        expect(action1.newRoot).to.deep.equal({
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'node',
                    id: 'child1',
                    position: { x: 10, y: 10 },
                    size: { width: 20, height: 20 },
                }
            ]
        })
        const action2 = dispatcher.actions[2] as UpdateModelAction
        expect(action2).to.be.instanceOf(UpdateModelAction)
        expect(action2.newRoot).to.equal(root2)
    })

    it('adds and removes elements', () => {
        const container = setup({ needsClientLayout: true })
        const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
        const dispatcher = container.get<MockActionDispatcher>(TYPES.IActionDispatcher)

        modelSource.addElements([
            {
                type: 'node',
                id: 'child1'
            },
            {
                type: 'node',
                id: 'child2'
            }
        ])
        expect(modelSource.model).to.deep.equal({
            type: 'NONE',
            id: 'ROOT',
            children: [
                {
                type: 'node',
                id: 'child1'
                },
                {
                    type: 'node',
                    id: 'child2'
                }
            ]
        })
        modelSource.removeElements(['child1'])
        expect(modelSource.model).to.deep.equal({
            type: 'NONE',
            id: 'ROOT',
            children: [
                {
                    type: 'node',
                    id: 'child2'
                }
            ]
        })

        expect(dispatcher.actions).to.have.lengthOf(2)
        const action0 = dispatcher.actions[0] as UpdateModelAction
        expect(action0.matches).to.deep.equal([
            {
                right: {
                    type: 'node',
                    id: 'child1'
                },
                rightParentId: 'ROOT'
            },
            {
                right: {
                    type: 'node',
                    id: 'child2'
                },
                rightParentId: 'ROOT'
            }
        ])
        const action1 = dispatcher.actions[1] as UpdateModelAction
        expect(action1.matches).to.deep.equal([
            {
                left: {
                    type: 'node',
                    id: 'child1'
                },
                leftParentId: 'ROOT'
            }
        ])
    })
})
