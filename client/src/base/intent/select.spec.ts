import {GGraph, GNode} from "../../graph/model/ggraph"
import {SelectCommand, SelectAction} from ".//select"
import {expect} from "chai"
import "mocha"
import {GModelRoot} from "../model/gmodel"
import {CommandExecutionContext} from "./commands"


describe('test select command execution, undo, redo and merge', () => {
    const myNode0 = {id: 'node0', type: 'node:circle', x: 100, y: 100, selected: true};
    const myNode1 = {id: 'node1', type: 'node:circle', x: 200, y: 200, selected: false};

    // setup the GModel
    const initialModel = new GGraph({
        id: 'graph',
        type: 'graph',
        children: [myNode1, myNode0]  // myNode0 is selected, so put at the end
    });

    // create the select action
    const mySelectAction = new SelectAction(
        ['node1'], // selected list
        ['node0']  // deselected list
    )

    const lastIndex = initialModel.children.length() - 1

    // create the select command
    const cmd = new SelectCommand(mySelectAction)

    // global so we can carry-over the model, as it's updated, 
    // from test case to test case (i,e, select, undo, redo, merge)
    var newModel: GModelRoot

    it('select command', () => {
        // execute command
        newModel = cmd.execute(initialModel)

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    });

    it('undo select command', () => {
        // test "undo"
        newModel = cmd.undo(newModel);

        // check result
        const nodes = <GNode[]>newModel.index.all().filter(
            element => (element instanceof GNode)
        )

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node0', newModel))
        expect(false).to.equal(isNodeSelected('node1', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node0', newModel))
        expect(0).to.equal(getNodeIndex('node1', newModel))

    });

    it('redo select command', () => {
        // test "redo"
        newModel = cmd.redo(newModel);

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    });

    // "merge" is N/A for selection
    it('merge select command (N/A)', () => {
        // test "merge"
        const result = cmd.merge(cmd);
        expect(false).to.equal(result)

        // confirm selection is as expected (i.e. unchanged)
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array  (i.e. unchanged)
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    });
})


function getNode(nodeId, model) {
    return <GNode>model.index.getById(nodeId)
}

function isNodeSelected(nodeId, model) {
    return getNode(nodeId, model).selected
}

function getNodeIndex(nodeId, model) {
    return model.children.indexOf(getNode(nodeId, model))
}
