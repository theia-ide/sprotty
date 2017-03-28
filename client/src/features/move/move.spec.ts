import "mocha"
import { expect } from "chai"
import { SGraphFactory } from "../../graph/model/sgraph-factory"
import { CommandExecutionContext } from "../../base/intent/commands"
import { SModelRoot } from "../../base/model/smodel"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { Point } from "../../utils/geometry"
import { SNode } from "../../graph/model/sgraph"
import { MoveCommand, MoveAction, ElementMove } from "./move"

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
    const moveAction = new MoveAction(moves, /* no annimate */ false)

    // create the command
    const cmd = new MoveCommand(moveAction)
    const context: CommandExecutionContext = {
        root: EMPTY_ROOT,
        modelFactory: graphFactory,
        duration: 0,
        modelChanged: undefined!
    }

    // global so we can carry-over the model, as it's updated, 
    // from test case to test case (i,e, select, undo, redo, merge)
    var newModel: SModelRoot | Promise<SModelRoot>

    it('execute() works as expected', () => {
        // execute command
        newModel = cmd.execute(model, context)

        // node0 => PointNE
        expect(pointNE.x).equals(getNode('node0', newModel).x)
        expect(pointNE.y).equals(getNode('node0', newModel).y)
        // node1 => pointSW
        expect(pointSW.x).equals(getNode('node1', newModel).x)
        expect(pointSW.y).equals(getNode('node1', newModel).y)
        // node2 => PointSE
        expect(pointSE.x).equals(getNode('node2', newModel).x)
        expect(pointSE.y).equals(getNode('node2', newModel).y)

    })

    // TODO: undo, redo, merge

    // note: not sure how to deal with promise returned by undo()
    // and redo()... 
    // Should undo()/redo() check whether the move action wants 
    // animation, and if not just return an updated model? 

    it('undo() works as expected', () => {
        // test "undo"
        cmd.undo(<SModelRoot>newModel, context).then(
            newModel => {
                // corfirm that each node is back at original
                // coordinates

                // node0, node1 and node2 => pointNW
                expect(pointNW.x).equals(getNode('node0', newModel).x)
                expect(pointNW.y).equals(getNode('node0', newModel).y)
                expect(pointNW.x).equals(getNode('node1', newModel).x)
                expect(pointNW.y).equals(getNode('node1', newModel).y)
                expect(pointNW.x).equals(getNode('node2', newModel).x)
                expect(pointNW.y).equals(getNode('node2', newModel).y)
            })
    })

    it('redo() works as expected', () => {
        // test "redo": 
        cmd.redo(<SModelRoot>newModel, context).then(
            newModel => {
                // corfirm that each node is back where ordered to move

                // node0 => PointNE
                expect(pointNE.x).equals(getNode('node0', newModel).x)
                expect(pointNE.y).equals(getNode('node0', newModel).y)
                // node1 => pointSW
                expect(pointSW.x).equals(getNode('node1', newModel).x)
                expect(pointSW.y).equals(getNode('node1', newModel).y)
                // node2 => PointSE
                expect(pointSE.x).equals(getNode('node2', newModel).x)
                expect(pointSE.y).equals(getNode('node2', newModel).y)
            })
    })

})

function getNode(nodeId, model) {
    return model.index.getById(nodeId) as SNode
}