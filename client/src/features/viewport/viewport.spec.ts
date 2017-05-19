/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import 'mocha'
import { AnimationFrameSyncer } from '../../base/index'
import { CommandExecutionContext } from '../../base/intent/commands'
import { SGraphFactory } from '../../graph/index'
import { almostEquals, ConsoleLogger } from '../../utils/index'
import { Viewport, ViewportAction, ViewportCommand } from '../index'
import { ViewportRootElement } from './viewport-root'
import { expect } from 'chai'

const viewportData: Viewport = { scroll: { x: 0, y: 0 }, zoom: 1 }

const modelFactory = new SGraphFactory()
const viewport: ViewportRootElement = modelFactory.createRoot({ id: 'viewport1', type: 'graph', children: [] }) as ViewportRootElement
viewport.zoom = viewportData.zoom
viewport.scroll = viewportData.scroll

const newViewportData: Viewport = { scroll: { x: 100, y: 100 }, zoom: 10 }

const viewportAction = new ViewportAction(viewport.id, newViewportData, false)
const cmd = new ViewportCommand(viewportAction)

const context: CommandExecutionContext = {
    root: viewport,
    modelFactory: modelFactory,
    duration: 0,
    modelChanged: undefined!,
    logger: new ConsoleLogger(),
    syncer: new AnimationFrameSyncer()
}

describe('BoundsAwareViewportCommand', () => {
    it('execute() works as expected', () => {
        cmd.execute(context)
        expect(almostEquals(viewport.zoom, newViewportData.zoom)).to.be.true
        expect(viewport.scroll).deep.equals(newViewportData.scroll)
    })

    it('undo() works as expected', () => {
        cmd.undo(context)
        expect(almostEquals(viewport.zoom, viewportData.zoom)).to.be.true
        expect(viewport.scroll).deep.equals(viewportData.scroll)
    })

    it('redo() works as expected', () => {
        cmd.redo(context)
        expect(almostEquals(viewport.zoom, newViewportData.zoom)).to.be.true
        expect(viewport.scroll).deep.equals(newViewportData.scroll)
    })

})
