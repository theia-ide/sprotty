import "mocha"
import { expect } from "chai"
import { SetBoundsCommand, SetBoundsAction } from "../index";
import { CommandExecutionContext } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../../base/animations/animation-frame-syncer"
import { SNode } from "../../graph/model/sgraph"
import { SGraphFactory } from "../../graph/index";
import { SNodeSchema } from "../../graph/model/sgraph"

const bounds0 = { x: 0, y: 0, width: 0, height: 0 }
const bounds1 = { x: 10, y: 10, width: 10, height: 10 }
const bounds2 = { x: 20, y: 20, width: 20, height: 20 }

const boundsInPage0 = { x: 1, y: 1, width: 1, height: 1 }
const boundsInPage1 = { x: 100, y: 100, width: 100, height: 100 }
const boundsInPage2 = { x: 200, y: 200, width: 200, height: 200 }

const modelFactory = new SGraphFactory()
const model = modelFactory.createRoot({ id: 'graph', type: 'graph', children: [] })
const nodeSchema0: SNodeSchema = { id: 'node0', type: 'node:circle', x: 0, y: 0, width: 0, height: 0 }
const nodeSchema1: SNodeSchema = { id: 'node1', type: 'node:circle', x: 0, y: 0, width: 0, height: 0 }

const node0: SNode = modelFactory.createElement(nodeSchema0) as SNode
const node1: SNode = modelFactory.createElement(nodeSchema1) as SNode
model.add(node0)
model.add(node1)

node0.bounds = bounds0
node1.bounds = bounds0

const mySetboundsAction = new SetBoundsAction(
    [
        { elementId: 'node0', newBounds: bounds1, newBoundsInPage: boundsInPage1 },
        { elementId: 'node1', newBounds: bounds2, newBoundsInPage: boundsInPage2 }
    ]
)

// create the set bounds command
const cmd = new SetBoundsCommand(mySetboundsAction)

const context: CommandExecutionContext = {
    root: EMPTY_ROOT,
    modelFactory: modelFactory,
    duration: 0,
    modelChanged: undefined!,
    logger: new ConsoleLogger(),
    syncer: new AnimationFrameSyncer()
}

describe('SetBoundsCommand', () => {
    it('execute() works as expected', () => {
        // sanity check for initial bounds values
        expect(bounds0).deep.equals(node0.bounds)
        expect(bounds0).deep.equals(node1.bounds)

        cmd.execute(model, context)

        expect(bounds1).deep.equals(node0.bounds)
        expect(bounds2).deep.equals(node1.bounds)
    })

    it('undo() works as expected', () => {
        cmd.undo(model, context)
        expect(bounds0).deep.equals(node0.bounds)
        expect(bounds0).deep.equals(node1.bounds)
    })

    it('redo() works as expected', () => {
        cmd.execute(model, context)
        expect(bounds1).deep.equals(node0.bounds)
        expect(bounds2).deep.equals(node1.bounds)
    })
})


