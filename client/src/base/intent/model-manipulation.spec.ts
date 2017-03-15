import { SGraph, SNode } from "../../graph/model/sgraph"
import { SetModelCommand, SetModelAction } from "./model-manipulation"
import { expect } from 'chai';
import 'mocha'
import {SGraphFactory} from "../../graph/model/sgraph-factory"
import {CommandExecutionContext} from "./commands"
import {SModel} from "../model/smodel"
import EMPTY_ROOT = SModel.EMPTY_ROOT

// note: it looks like the API for the set-model command is not
// finalized. Let's still give the tests a first shot - we can adjust
// as the command evolves.
describe('test set model command execution, undo, redo and merge', () => {

    const graphFactory = new SGraphFactory()

    // setup the GModel
    const model1 = graphFactory.createRoot({
        id: 'model1',
        type: 'graph',
        children: []
    });

    const model2 = graphFactory.createRoot({
        id: 'model2',
        type: 'graph',
        children: []
    });

    const modelBogus = graphFactory.createRoot({
        id: 'bogus',
        type: 'graph',
        children: []
    });

    // create the action
    const mySetModelAction = new SetModelAction(model2 /* the new model */)

    // create the command
    const cmd = new SetModelCommand(mySetModelAction)
    const context: CommandExecutionContext = {
        root: EMPTY_ROOT,
        modelFactory: graphFactory,
        duration: 0,
        modelChanged: undefined!
    }


    it('set model command', () => {
        // execute command
        const newModel = cmd.execute(model1 /* the old model */, context)
        expect(model2).equal(newModel)
        expect(model1).equal(cmd.oldRoot)
        expect(model2).equal(cmd.newRoot)
    });

    it('undo set model command', () => {
        // test "undo": returns old model
        expect(model1).equal(cmd.undo(/* note: param ignored */ modelBogus))
    });

    it('redo set model command', () => {
        // test "redo": returns new model
        expect(model2).equal(cmd.redo(/* note: param ignored */ modelBogus ))

    });

    // "merge" is N/A
    it('merge set model command (N/A)', () => {
        // test "merge"
        const result = cmd.merge(/* note: param ignored */ cmd);
        expect(false).to.equal(result)
    });
})