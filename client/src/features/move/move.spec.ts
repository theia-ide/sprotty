import { DH_UNABLE_TO_CHECK_GENERATOR } from 'constants';
import "mocha"
import { expect } from "chai"
import { SGraphFactory } from "../../graph/model/sgraph-factory"
import { CommandExecutionContext } from "../../base/intent/commands"
import { SModelRoot } from "../../base/model/smodel"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { Point } from "../../utils/geometry"
import { SNode } from "../../graph/model/sgraph"
import { ElementMove, MoveAction, MoveCommand } from "./move"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../../base/animations/animation-frame-syncer"

describe('move', () => {

    const graphFactory = new SGraphFactory()

    const pointNW: Point = { x: 0, y: 0 }
    const pointNE: Point = { x: 300, y: 1 }
    const pointSW: Point = { x: 1, y: 300 }
    const pointSE: Point = { x: 301, y: 301 }

    // nodes start at pointNW
    const myNode0 = {
        id: 'node0', type: 'node:circle',
        x: pointNW.x, y: pointNW.y,
        selected: false
    }
    const myNode1 = {
        id: 'node1', type: 'node:circle',
        x: pointNW.x, y: pointNW.y,
        selected: false
    }
    const myNode2 = {
        id: 'node2', type: 'node:circle',
        x: pointNW.x, y: pointNW.y,
        selected: false
    }

    // setup the GModel
    const model = graphFactory.createRoot({
        id: 'model1',
        type: 'graph',
        children: [myNode0, myNode1, myNode2]
    })

    // move each node to a different corner
    const moves: ElementMove[] = [
        {
            elementId: myNode0.id,
            toPosition: {
                x: pointNE.x, y: pointNE.y
            }
        },
        {
            elementId: myNode1.id,
            toPosition: {
                x: pointSW.x, y: pointSW.y
            }
        },
        {
            elementId: myNode2.id,
            toPosition: {
                x: pointSE.x, y: pointSE.y
            }
        }
    ]

    // create the action
    const moveAction = new MoveAction(moves, /* no animate */ false)

    // create the command
    const cmd = new MoveCommand(moveAction)
    const context: CommandExecutionContext = {
        root: model,
        modelFactory: graphFactory,
        duration: 0,
        modelChanged: undefined!,
        logger: new ConsoleLogger(),
        syncer: new AnimationFrameSyncer()
    }

    // global so we can carry-over the model, as it's updated, 
    // from test case to test case (i,e, select, undo, redo, merge)
    let newModel: SModelRoot

    function getNode(nodeId: string, model: SModelRoot) {
        return model.index.getById(nodeId) as SNode
    }

    it('execute() works as expected', () => {
        // execute command
        newModel = cmd.execute(context) as SModelRoot

        // node0 => PointNE
        expect(pointNE.x).equals(getNode('node0', newModel).bounds.x)
        expect(pointNE.y).equals(getNode('node0', newModel).bounds.y)
        // node1 => pointSW
        expect(pointSW.x).equals(getNode('node1', newModel).bounds.x)
        expect(pointSW.y).equals(getNode('node1', newModel).bounds.y)
        // node2 => PointSE
        expect(pointSE.x).equals(getNode('node2', newModel).bounds.x)
        expect(pointSE.y).equals(getNode('node2', newModel).bounds.y)

    })

    // TODO: undo, redo, merge

    // note: not sure how to deal with promise returned by undo()
    // and redo()... 
    // Should undo()/redo() check whether the move action wants 
    // animation, and if not just return an updated model? 

    let undoneModel: SModelRoot

    it('undo() works as expected', async () => {
        // test "undo"
        context.root = newModel
        undoneModel = await cmd.undo(context)
        
        // confirm that each node is back at original
        // coordinates
        // node0, node1 and node2 => pointNW
        expect(pointNW.x).equals(getNode('node0', undoneModel).bounds.x)
        expect(pointNW.y).equals(getNode('node0', undoneModel).bounds.y)
        expect(pointNW.x).equals(getNode('node1', undoneModel).bounds.x)
        expect(pointNW.y).equals(getNode('node1', undoneModel).bounds.y)
        expect(pointNW.x).equals(getNode('node2', undoneModel).bounds.x)
        expect(pointNW.y).equals(getNode('node2', undoneModel).bounds.y)
    })

    it('redo() works as expected', async () => {
        // test "redo": 
        context.root = undoneModel
        const redoneModel = await cmd.redo(context)

        // confirm that each node is back where ordered to move
        // node0 => PointNE
        expect(pointNE.x).equals(getNode('node0', redoneModel).bounds.x)
        expect(pointNE.y).equals(getNode('node0', redoneModel).bounds.y)
        // node1 => pointSW
        expect(pointSW.x).equals(getNode('node1', redoneModel).bounds.x)
        expect(pointSW.y).equals(getNode('node1', redoneModel).bounds.y)
        // node2 => PointSE
        expect(pointSE.x).equals(getNode('node2', redoneModel).bounds.x)
        expect(pointSE.y).equals(getNode('node2', redoneModel).bounds.y)
    })

})
