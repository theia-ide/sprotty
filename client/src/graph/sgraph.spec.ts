/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha"
import { expect } from "chai"
import { SNode, SEdge, SGraph } from './sgraph';

describe('SGraphIndex', () => {
    function setup() {
        const root = new SGraph()
        const node1 = new SNode()
        node1.id = 'node1'
        root.add(node1)
        const node2 = new SNode()
        node2.id = 'node2'
        root.add(node2)
        const edge1 = new SEdge()
        edge1.id = 'edge1'
        edge1.sourceId = node1.id
        edge1.targetId = node2.id
        root.add(edge1)
        return { root, node1, node2, edge1 }
    }

    it('tracks outgoing edges of a node', () => {
        const ctx = setup()
        const a = Array.from(ctx.node1.outgoingEdges)
        expect(a).to.be.of.length(1)
        expect(a[0].id).to.equal('edge1')
    })
    it('tracks incoming edges of a node', () => {
        const ctx = setup()
        const a = Array.from(ctx.node2.incomingEdges)
        expect(a).to.be.of.length(1)
        expect(a[0].id).to.equal('edge1')
    })
    it('does not contain outgoing or incoming edges after removing them', () => {
        const ctx = setup()
        ctx.root.remove(ctx.edge1)
        expect(Array.from(ctx.node1.outgoingEdges)).to.be.of.length(0)
        expect(Array.from(ctx.node2.incomingEdges)).to.be.of.length(0)
    })
})
