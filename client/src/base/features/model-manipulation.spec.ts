import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import { SModelElement, SModelElementSchema, SModelRootSchema } from "../model/smodel"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { SGraphFactory } from "../../graph/model/sgraph-factory"
import { CommandExecutionContext } from "../intent/commands"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"
import { SetModelAction, SetModelCommand } from "./model-manipulation"

function compare(expected: SModelElementSchema, actual: SModelElement) {
    for (const p in expected) {
        const expectedProp = (expected as any)[p]
        const actualProp = (actual as any)[p]
        if (p == 'children') {
            for (const i in expectedProp) {
                compare(expectedProp[i], actualProp[i])
            }
        } else {
            expect(actualProp).to.deep.equal(expectedProp)
        }
    }
}

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
        context.root = model1  /* the old model */
        const newModel = cmd.execute(context)
        compare(model2, newModel)
        expect(model1).to.equal(cmd.oldRoot)
        expect(newModel).to.equal(cmd.newRoot)
    })

    it('undo() returns the previous model', () => {
        // test "undo": returns old model
        expect(model1).to.equal(cmd.undo(context))
    })

    it('redo() returns the new model', () => {
        // test "redo": returns new model
        const newModel = cmd.redo(context)
        compare(model2, newModel)
    })
})
