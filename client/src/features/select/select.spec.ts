/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha"
import { expect } from "chai"
import { SModelRoot } from "../../base/model/smodel"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { SGraphFactory } from "../../graph/model/sgraph-factory"
import { CommandExecutionContext } from "../../base/intent/commands"
import { SNode } from "../../graph/model/sgraph"
import { SelectAction, SelectCommand } from "./select"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../../base/animations/animation-frame-syncer"

describe('select', () => {
    // setup the GModel
    const modelFactory = new SGraphFactory()
    const myNode0 = {id: 'node0', type: 'node:circle', x: 100, y: 100, selected: true}
    const myNode1 = {id: 'node1', type: 'node:circle', x: 200, y: 200, selected: false}
    const initialModel = modelFactory.createRoot({
        id: 'graph',
        type: 'graph',
        children: [myNode1, myNode0]  // myNode0 is selected, so put at the end
    })

    // create the select action
    const mySelectAction = new SelectAction(
        ['node1'], // selected list
        ['node0']  // deselected list
    )

    const lastIndex = initialModel.children.length - 1

    // create the select command
    const cmd = new SelectCommand(mySelectAction)

    // global so we can carry-over the model, as it's updated, 
    // from test case to test case (i,e, select, undo, redo, merge)
    let newModel: SModelRoot

    const context: CommandExecutionContext = {
        root: EMPTY_ROOT,
        modelFactory: modelFactory,
        duration: 0,
        modelChanged: undefined!,
        logger: new ConsoleLogger(),
        syncer: new AnimationFrameSyncer()
    }

    function getNode(nodeId: string, model: SModelRoot) {
        return <SNode>model.index.getById(nodeId)
    }

    function isNodeSelected(nodeId: string, model: SModelRoot) {
        return getNode(nodeId, model).selected
    }

    function getNodeIndex(nodeId: string, model: SModelRoot) {
        return model.children.indexOf(getNode(nodeId, model))
    }

    it('execute() works as expected', () => {
        // execute command
        context.root = initialModel
        newModel = cmd.execute(context)

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    })

    it('undo() works as expected', () => {
        // test "undo"
        context.root = newModel
        newModel = cmd.undo(context)

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node0', newModel))
        expect(false).to.equal(isNodeSelected('node1', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node0', newModel))
        expect(0).to.equal(getNodeIndex('node1', newModel))

    })

    it('redo() works as expected', () => {
        // test "redo"
        context.root = newModel
        newModel = cmd.redo(context)

        // confirm selection is as expected
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    })

    // "merge" is N/A for selection
/*    
    it('merge() works as expected (N/A)', () => {
        // test "merge"
        const result = cmd.merge(cmd, context)
        expect(false).to.equal(result)

        // confirm selection is as expected (i.e. unchanged)
        expect(true).to.equal(isNodeSelected('node1', newModel))
        expect(false).to.equal(isNodeSelected('node0', newModel))

        // the selected node is moved at the end of the array  (i.e. unchanged)
        expect(lastIndex).to.equal(getNodeIndex('node1', newModel))
        expect(0).to.equal(getNodeIndex('node0', newModel))
    }); */
})
