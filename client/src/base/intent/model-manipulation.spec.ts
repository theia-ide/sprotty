import { GGraph, GNode } from "../../graph/model/ggraph"
import { SetModelCommand, SetModelAction } from "./model-manipulation"
import { expect } from 'chai';
import 'mocha'

// note: it looks like the API for the set-model command is not 
// finalized. Let's still give the tests a first shot - we can adjust
// as the command evolves.
describe('test set model command execution, undo, redo and merge', () => {
    // setup the GModel
    const model1 = new GGraph({
        id: 'model1',
        type: 'graph',
        children: [] 
    });

    const model2 = new GGraph({
        id: 'model2',
        type: 'graph',
        children: [] 
    });

    const modelBogus = new GGraph({
        id: 'bogus',
        type: 'graph',
        children: [] 
    });

    // create the action
    const mySetModelAction = new SetModelAction(model2 /* the new model */)

    // create the command
    const cmd = new SetModelCommand(mySetModelAction)

    it('set model command', () => {
        // execute command
        const newModel = cmd.execute(model1 /* the old model */)
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