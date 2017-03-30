import "mocha"
import { expect } from "chai"
import { SetBoundsCommand, SetBoundsAction,  BoundsInPageAware} from "../index";
import { CommandExecutionContext } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../../base/animations/animation-frame-syncer"
import { SNode } from "../../graph/model/sgraph"
import { SGraphFactory } from "../../graph/index";
import { SNodeSchema } from "../../graph/model/sgraph"
import { EMPTY_BOUNDS, Bounds } from "../../utils/index";

// ATM SNode is not "BoundsInPageAware", so let's make out own
class mySNode extends SNode implements BoundsInPageAware {
    boundsInPage: Bounds = EMPTY_BOUNDS
}

const boundsInitial = { x: 0, y: 0, width: 0, height: 0 }
const bounds1 = { x: 10, y: 10, width: 10, height: 10 }
const bounds2 = { x: 20, y: 20, width: 20, height: 20 }
const boundsInPageInitial = { x: 1, y: 1, width: 1, height: 1 }
const boundsInPage1 = { x: 100, y: 100, width: 100, height: 100 }

const modelFactory = new SGraphFactory()
const model = modelFactory.createRoot({ id: 'graph', type: 'graph', children: [] })
const nodeSchema0: SNodeSchema = { id: 'node0', type: 'node:circle', x: 0, y: 0, width: 0, height: 0 }
const nodeSchema1: SNodeSchema = { id: 'node1', type: 'node:circle', x: 0, y: 0, width: 0, height: 0 }

const nodeBoundsAware: SNode = modelFactory.createElement(nodeSchema0) as SNode
const nodeBoundsInPageAware: mySNode = modelFactory.createElement(nodeSchema1) as mySNode

model.add(nodeBoundsAware)
model.add(nodeBoundsInPageAware)

nodeBoundsAware.bounds = boundsInitial
nodeBoundsInPageAware.bounds = boundsInitial
nodeBoundsInPageAware.boundsInPage = boundsInPageInitial

const mySetboundsAction = new SetBoundsAction(
    [
        { elementId: 'node0', newBounds: bounds1 },
        { elementId: 'node1', newBounds: bounds2, newBoundsInPage: boundsInPage1 }
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
        expect(boundsInitial).deep.equals(nodeBoundsAware.bounds)
        expect(boundsInitial).deep.equals(nodeBoundsInPageAware.bounds)
        expect(boundsInPageInitial).deep.equals(nodeBoundsInPageAware.boundsInPage)
        cmd.execute(model, context)

        expect(bounds1).deep.equals(nodeBoundsAware.bounds)
        expect(bounds2).deep.equals(nodeBoundsInPageAware.bounds)
        expect(boundsInPage1).deep.equals(nodeBoundsInPageAware.boundsInPage)
    })

    it('undo() works as expected', () => {
        cmd.undo(model, context)
        expect(boundsInitial).deep.equals(nodeBoundsAware.bounds)
        expect(boundsInitial).deep.equals(nodeBoundsInPageAware.bounds)
        expect(boundsInPageInitial).deep.equals(nodeBoundsInPageAware.boundsInPage)
    })

    it('redo() works as expected', () => {
        cmd.redo(model, context)
        expect(bounds1).deep.equals(nodeBoundsAware.bounds)
        expect(bounds2).deep.equals(nodeBoundsInPageAware.bounds)
        expect(boundsInPage1).deep.equals(nodeBoundsInPageAware.boundsInPage)
    }) 
})


