import { GGraph, GNode } from "../src/graph/GModel"
import { SelectCommand, SelectAction } from "../src/base/intent/Select";
import { expect, should } from 'chai';
import 'mocha'
import { GModelRoot } from "../src/base/model/GModel";

const myNode0 = { id: 'node0', type: 'circle', x: 100, y: 100, selected: true };
const myNode1 = { id: 'node1', type: 'circle', x: 200, y: 200, selected: false };

// setup the GModel
const model = new GGraph({
    id: 'graph',
    type: 'graph',
    shapes: [myNode0, myNode1]
});

// create the action
const mySelectAction = new SelectAction(
    ['node1'], // selected list
    ['node0']  // deselected list
)

// create the select command
const cmd = new SelectCommand(mySelectAction)

var newModel: GModelRoot

describe('test select command execution, undo and redo', () => {
    it('select command', () => {
        // execute command
        newModel = cmd.execute(model)

        // check result
        const nodes = <GNode[]>newModel.index.all().filter(
            element => (element instanceof GNode)
        )
        const node0 = <GNode>newModel.index.getById('node0')
        const node1 = <GNode>newModel.index.getById('node1')

        expect(node0.selected).to.equal(false)
        expect(node1.selected).to.equal(true)

        // note: not sure what this test achieves? make sure that 
        // node selection doesn't mess with children ordering 
        // in the model? 
        expect(nodes.indexOf(node0)).to.equal(0)
        expect(nodes.indexOf(node1)).to.equal(1)
    });

    it('undo select command', () => {
        // test "undo"
        newModel = cmd.undo(newModel);

        // check result
        const nodes = <GNode[]>newModel.index.all().filter(
            element => (element instanceof GNode)
        )
        const node0 = <GNode>newModel.index.getById('node0')
        const node1 = <GNode>newModel.index.getById('node1')

        expect(node0.selected).to.equal(true)
        expect(node1.selected).to.equal(false)
    });
    it('redo select command', () => {
        // test "redo"
        newModel = cmd.redo(newModel);

        // check result
        const nodes = <GNode[]>newModel.index.all().filter(
            element => (element instanceof GNode)
        )
        const node0 = <GNode>newModel.index.getById('node0')
        const node1 = <GNode>newModel.index.getById('node1')

        expect(node0.selected).to.equal(false)
        expect(node1.selected).to.equal(true)
    });


})


