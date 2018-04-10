/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha";
import { expect } from "chai";
import { SNode, SEdge, SGraph, SPort } from './sgraph';
import { RectangularNode, RectangularPort } from '../lib/model';

describe('SGraphIndex', () => {
    function setup() {
        const root = new SGraph();
        const node1 = new SNode();
        node1.id = 'node1';
        root.add(node1);
        const node2 = new SNode();
        node2.id = 'node2';
        root.add(node2);
        const edge1 = new SEdge();
        edge1.id = 'edge1';
        edge1.sourceId = node1.id;
        edge1.targetId = node2.id;
        root.add(edge1);
        return { root, node1, node2, edge1 };
    }

    it('tracks outgoing edges of a node', () => {
        const ctx = setup();
        const a = Array.from(ctx.node1.outgoingEdges);
        expect(a).to.be.of.length(1);
        expect(a[0].id).to.equal('edge1');
    });
    it('tracks incoming edges of a node', () => {
        const ctx = setup();
        const a = Array.from(ctx.node2.incomingEdges);
        expect(a).to.be.of.length(1);
        expect(a[0].id).to.equal('edge1');
    });
    it('does not contain outgoing or incoming edges after removing them', () => {
        const ctx = setup();
        ctx.root.remove(ctx.edge1);
        expect(Array.from(ctx.node1.outgoingEdges)).to.be.of.length(0);
        expect(Array.from(ctx.node2.incomingEdges)).to.be.of.length(0);
    });
});

describe('anchor computation', () => {
    function createModel() {
        const model = new SGraph();
        model.type = 'graph';
        model.id = 'graph';
        const node1 = new RectangularNode();
        node1.type = 'node';
        node1.id = 'node1';
        node1.position = { x: 10, y: 10 };
        node1.size = { width: 10, height: 10 };
        model.add(node1);
        const port1 = new RectangularPort();
        port1.type = 'port';
        port1.id = 'port1';
        port1.position = { x: 10, y: 4 };
        port1.size = { width: 2, height: 2 };
        port1.strokeWidth = 0;
        node1.add(port1);
        const node2 = new RectangularNode();
        node2.type = 'node';
        node2.id = 'node2';
        node2.position = { x: 30, y: 10 };
        node2.size = { width: 10, height: 10 };
        model.add(node2);
        const port2 = new RectangularPort();
        port2.type = 'port';
        port2.id = 'port2';
        port2.position = { x: -2, y: 4 };
        port2.size = { width: 2, height: 2 };
        port2.strokeWidth = 0;
        node2.add(port2);
        const edge1 = new SEdge();
        edge1.type = 'edge';
        edge1.id = 'edge1';
        edge1.sourceId = 'port1';
        edge1.targetId = 'port2';
        model.add(edge1);
        return model;
    }

    it('correctly translates edge source position', () => {
        const model = createModel();
        const edge = model.index.getById('edge1') as SEdge;
        const sourcePort = model.index.getById('port1') as SPort;
        const refPoint = { x: 30, y: 15 };
        const translated = sourcePort.getTranslatedAnchor(refPoint, edge.parent, edge);
        expect(translated).to.deep.equal({ x: 22, y: 15, width: -1, height: -1 });
    });

    it('correctly translates edge target position', () => {
        const model = createModel();
        const edge = model.index.getById('edge1') as SEdge;
        const targetPort = model.index.getById('port2') as SPort;
        const refPoint = { x: 20, y: 15 };
        const translated = targetPort.getTranslatedAnchor(refPoint, edge.parent, edge);
        expect(translated).to.deep.equal({ x: 28, y: 15, width: -1, height: -1 });
    });

    it('correctly translates edge source to target position', () => {
        const model = createModel();
        const edge = model.index.getById('edge1') as SEdge;
        const sourcePort = model.index.getById('port1') as SPort;
        const targetPort = model.index.getById('port2') as SPort;
        const refPoint = { x: 10, y: 5 };
        const translated = targetPort.getTranslatedAnchor(refPoint, sourcePort.parent, edge);
        expect(translated).to.deep.equal({ x: 28, y: 15, width: -1, height: -1 });
    });
});
