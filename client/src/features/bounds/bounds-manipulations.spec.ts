/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha"
import { expect } from "chai"
import { SetBoundsAction, SetBoundsCommand } from "../index"
import { CommandExecutionContext } from "../../base/intent/commands"
import { EMPTY_ROOT } from "../../base/model/smodel-factory"
import { ConsoleLogger } from "../../utils/logging"
import { AnimationFrameSyncer } from "../../base/animations/animation-frame-syncer"
import { SGraph, SNode, SNodeSchema } from "../../graph/model/sgraph"
import { SGraphFactory } from "../../graph/index"

const boundsInitial = { x: 0, y: 0, width: 0, height: 0 }
const bounds1 = { x: 10, y: 10, width: 10, height: 10 }
const boundsInPageInitial = { x: 1, y: 1, width: 1, height: 1 }
const boundsInPage1 = { x: 100, y: 100, width: 100, height: 100 }

const modelFactory = new SGraphFactory()
const model = modelFactory.createRoot({ id: 'graph', type: 'graph', children: [] }) as SGraph
const nodeSchema0: SNodeSchema = { id: 'node0', type: 'node:circle', position: { x: 0, y: 0}, size: { width: 0, height: 0 } }

const nodeBoundsAware: SNode = modelFactory.createElement(nodeSchema0) as SNode

model.add(nodeBoundsAware)

nodeBoundsAware.bounds = boundsInitial

const mySetBoundsAction = new SetBoundsAction(
    [
        { elementId: 'node0', newBounds: bounds1 }
    ]
)

// create the set bounds command
const setBoundsCommand = new SetBoundsCommand(mySetBoundsAction)

const context: CommandExecutionContext = {
    root: model,
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
        setBoundsCommand.execute(context)
        expect(bounds1).deep.equals(nodeBoundsAware.bounds)
    })

    it('undo() works as expected', () => {
        setBoundsCommand.undo(context)
        expect(boundsInitial).deep.equals(nodeBoundsAware.bounds)
    })

    it('redo() works as expected', () => {
        setBoundsCommand.redo(context)
        expect(bounds1).deep.equals(nodeBoundsAware.bounds)
    })
})



