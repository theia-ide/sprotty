import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import { SModelElement, SModelElementSchema, SModelRoot, SModelRootSchema } from "../model/smodel"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { SNodeSchema } from "../../graph/model/sgraph"
import { SGraphFactory } from "../../graph/model/sgraph-factory"
import { CommandExecutionContext } from "../intent/commands"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"
import { FadeAnimation } from "../../features/fade/fade"
import { MoveAnimation } from "../../features/move/move"
import { CompoundAnimation } from "../animations/animation"
import { SetModelAction, SetModelCommand, UpdateModelCommand } from "./model-manipulation"

function compare(expected: SModelElementSchema, actual: SModelElement) {
    for (const p in expected) {
        const expectedProp = (expected as any)[p]
        const actualProp = (actual as any)[p]
        if (p == 'children') {
            for (const i in expectedProp) {
                compare(expectedProp[i], actualProp[i])
            }
        } else {
            expect(expectedProp).to.deep.equal(actualProp)
        }
    }
}

// note: it looks like the API for the set-model command is not
// finalized. Let's still give the tests a first shot - we can adjust
// as the command evolves.
describe('SetModelCommand', () => {
    const graphFactory = new SGraphFactory()
    const context: CommandExecutionContext = {
        root: EMPTY_ROOT,
        modelFactory: graphFactory,
        duration: 0,
        modelChanged: undefined!,
        logger: new ConsoleLogger(),
        syncer: new AnimationFrameSyncer()
    }

    // setup the GModel
    const model1 = graphFactory.createRoot({
        id: 'model1',
        type: 'graph',
        children: []
    })

    const model2: SModelRootSchema = {
        id: 'model2',
        type: 'graph',
        children: []
    }

    const modelBogus = graphFactory.createRoot({
        id: 'bogus',
        type: 'graph',
        children: []
    })

    // create the action
    const mySetModelAction = new SetModelAction(model2 /* the new model */)

    // create the command
    const cmd = new SetModelCommand(mySetModelAction)


    it('execute() returns the new model', () => {
        // execute command
        const newModel = cmd.execute(model1 /* the old model */, context)
        compare(model2, newModel)
        expect(model1).to.equal(cmd.oldRoot)
        expect(newModel).to.equal(cmd.newRoot)
    })

    it('undo() returns the previous model', () => {
        // test "undo": returns old model
        expect(model1).to.equal(cmd.undo(/* note: param ignored */ modelBogus))
    })

    it('redo() returns the new model', () => {
        // test "redo": returns new model
        const newModel = cmd.redo(/* note: param ignored */ modelBogus)
        compare(model2, newModel)
    })

    // "merge" is N/A
/*    it('merge() works as expected', () => {
        // test "merge"
        const result = cmd.merge(cmd, context);
        expect(false).to.equal(result)
    }); */
})


describe('UpdateModelCommand', () => {
    const graphFactory = new SGraphFactory()
    const context: CommandExecutionContext = {
        root: EMPTY_ROOT,
        modelFactory: graphFactory,
        duration: 0,
        modelChanged: undefined!,
        logger: new ConsoleLogger(),
        syncer: new AnimationFrameSyncer()
    }

    const model1 = graphFactory.createRoot({
        id: 'model',
        type: 'graph',
        children: []
    })

    const model2: SModelRootSchema = {
        id: 'model',
        type: 'graph2',
        children: []
    }

    const command1 = new UpdateModelCommand({
        kind: UpdateModelCommand.KIND,
        modelType: 'graph2',
        modelId: 'model',
        newRoot: model2,
        animate: false
    })

    it('replaces the model if animation is suppressed', () => {
        const newModel = command1.execute(model1 /* the old model */, context)
        compare(model2, newModel as SModelRoot)
        expect(model1).to.equal(command1.oldRoot)
        expect(newModel).to.equal(command1.newRoot)
    })

    it('undo() returns the previous model', () => {
        expect(model1).to.equal(command1.undo(EMPTY_ROOT))
    })

    it('redo() returns the new model', () => {
        const newModel = command1.redo(EMPTY_ROOT)
        compare(model2, newModel)
    })

    class TestUpdateModelCommand extends UpdateModelCommand {
        testAnimation(root: SModelRoot, context: CommandExecutionContext) {
            this.oldRoot = root
            this.newRoot = context.modelFactory.createRoot(this.action.newRoot!)
            return this.computeAnimation(this.oldRoot, this.newRoot, context)
        }
    }

    it('fades in new elements', () => {
        const command2 = new TestUpdateModelCommand({
            kind: UpdateModelCommand.KIND,
            modelType: 'graph',
            modelId: 'model1',
            newRoot: {
                type: 'graph',
                id: 'model',
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
            }
        })
        const animation = command2.testAnimation(model1, context)
        expect(animation).to.be.an.instanceOf(FadeAnimation)
        const fades = (animation as FadeAnimation).elementFades
        expect(fades).to.have.lengthOf(2)
        for (const fade of fades) {
            expect(fade.type).to.equal('in')
            expect(fade.element.type).to.equal('node')
            expect(fade.element.id).to.be.oneOf(['child1', 'child2'])
        }
    })

    it('fades out deleted elements', () => {
        const model3 = graphFactory.createRoot({
            type: 'graph',
            id: 'model',
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
        const command2 = new TestUpdateModelCommand({
            kind: UpdateModelCommand.KIND,
            modelType: 'graph',
            modelId: 'model',
            newRoot: {
                type: 'graph',
                id: 'model',
                children: []
            }
        })
        const animation = command2.testAnimation(model3, context)
        expect(animation).to.be.an.instanceOf(FadeAnimation)
        const fades = (animation as FadeAnimation).elementFades
        expect(fades).to.have.lengthOf(2)
        for (const fade of fades) {
            expect(fade.type).to.equal('out')
            expect(fade.element.type).to.equal('node')
            expect(fade.element.id).to.be.oneOf(['child1', 'child2'])
        }
    })

    it('moves relocated elements', () => {
        const model3 = graphFactory.createRoot({
            type: 'graph',
            id: 'model',
            children: [
                {
                    type: 'node',
                    id: 'child1',
                    x: 100,
                    y: 100
                } as SNodeSchema
            ]
        })
        const command2 = new TestUpdateModelCommand({
            kind: UpdateModelCommand.KIND,
            modelType: 'graph',
            modelId: 'model',
            newRoot: {
                type: 'graph',
                id: 'model',
                children: [
                    {
                        type: 'node',
                        id: 'child1',
                        x: 150,
                        y: 200
                    } as SNodeSchema
                ]
            }
        })
        const animation = command2.testAnimation(model3, context)
        expect(animation).to.be.an.instanceOf(MoveAnimation)
        const moves = (animation as MoveAnimation).elementMoves
        const child1Move = moves.get('child1')!
        expect(child1Move.elementId).to.equal('child1')
        expect(child1Move.fromPosition).to.deep.equal({ x: 100, y: 100 })
        expect(child1Move.toPosition).to.deep.equal({ x: 150, y: 200 })
    })

    it('combines fade and move animations', () => {
        const model3 = graphFactory.createRoot({
            type: 'graph',
            id: 'model',
            children: [
                {
                    type: 'node',
                    id: 'child1',
                    x: 100,
                    y: 100
                } as SNodeSchema,
                {
                    type: 'node',
                    id: 'child2'
                }
            ]
        })
        const command2 = new TestUpdateModelCommand({
            kind: UpdateModelCommand.KIND,
            modelType: 'graph',
            modelId: 'model',
            newRoot: {
                type: 'graph',
                id: 'model',
                children: [
                    {
                        type: 'node',
                        id: 'child1',
                        x: 150,
                        y: 200
                    } as SNodeSchema,
                    {
                        type: 'node',
                        id: 'child3'
                    }
                ]
            }
        })
        const animation = command2.testAnimation(model3, context)
        expect(animation).to.be.an.instanceOf(CompoundAnimation)
        const components = (animation as CompoundAnimation).components
        expect(components).to.have.lengthOf(2)
        const fadeAnimation = components[0] as FadeAnimation
        expect(fadeAnimation).to.be.an.instanceOf(FadeAnimation)
        expect(fadeAnimation.elementFades).to.have.lengthOf(2)
        for (const fade of fadeAnimation.elementFades) {
            if (fade.type == 'in')
                expect(fade.element.id).to.equal('child3')
            else if (fade.type == 'out')
                expect(fade.element.id).to.equal('child2')
        }
        const moveAnimation = components[1] as MoveAnimation
        expect(moveAnimation).to.be.an.instanceOf(MoveAnimation)
        const child1Move = moveAnimation.elementMoves.get('child1')!
        expect(child1Move.elementId).to.equal('child1')
        expect(child1Move.fromPosition).to.deep.equal({ x: 100, y: 100 })
        expect(child1Move.toPosition).to.deep.equal({ x: 150, y: 200 })
    })
})
