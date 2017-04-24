import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import { injectable, Container } from "inversify"
import { TYPES } from "../types"
import { Action } from "../intent/actions"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { ViewerOptions } from "../view/options"
import { SetModelAction, UpdateModelAction } from "../features/model-manipulation"
import defaultModule from "../di.config"
import { LocalModelSource } from "./model-source"
import { SModelRootSchema } from "./smodel"
import { ComputedBoundsAction, RequestBoundsAction } from "../../features/bounds/bounds-manipulation"

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

    function setup(boundsComputation: 'fixed' | 'dynamic') {
        const container = new Container()
        container.load(defaultModule)
        container.rebind(TYPES.IActionDispatcher).to(MockActionDispatcher).inSingletonScope()
        container.rebind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
            baseDiv: 'sprotty',
            boundsComputation: boundsComputation
        })
        return container
    }

    it('sets the model in fixed mode', () => {
        const container = setup('fixed')
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
        const action0 = dispatcher.actions[0] as SetModelAction
        expect(action0).to.be.instanceOf(SetModelAction)
        expect(action0.newRoot).to.equal(root1)
        const action1 = dispatcher.actions[1] as UpdateModelAction
        expect(action1).to.be.instanceOf(UpdateModelAction)
        expect(action1.newRoot).to.equal(root2)
    })

    it('requests bounds in dynamic mode', () => {
        const container = setup('dynamic')
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
        expect(action0.root).to.equal(root1)
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
                    revalidateBounds: false
                }
            ]
        })
        const action2 = dispatcher.actions[2] as RequestBoundsAction
        expect(action2).to.be.instanceOf(RequestBoundsAction)
        expect(action2.root).to.equal(root2)
    })

    it('adds and removes elements', () => {
        const container = setup('dynamic')
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
