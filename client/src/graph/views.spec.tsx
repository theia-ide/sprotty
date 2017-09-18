/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import * as snabbdom from "snabbdom-jsx"
import { Container } from "inversify"
import { VNode } from "snabbdom/vnode"
import { TYPES } from "../base/types"
import { IVNodeDecorator } from '../base/views/vnode-decorators'
import { CircularNodeView, RectangularNodeView } from "../lib/svg-views"
import { RenderingContext, ViewRegistry } from "../base/views/view"
import { ModelRendererFactory } from "../base/views/viewer"
import { SGraphView, PolylineEdgeView } from "./views"
import { SEdge, SGraph, SNode, SNodeSchema, SEdgeSchema, SPortSchema, SPort } from "./sgraph"
import { SGraphFactory } from "./sgraph-factory"
import defaultModule from "../base/di.config"
import selectModule from "../features/select/di.config"
import moveModule from "../features/move/di.config"

const toHTML = require('snabbdom-to-html')
const JSX = {createElement: snabbdom.svg}

describe('graph views', () => {
    class CircleNodeView extends CircularNodeView {
        render(node: SNode, context: RenderingContext): VNode {
            const radius = this.getRadius(node)
            return <g>
                    <circle class-node={true} class-selected={node.selected} r={radius} cx={radius} cy={radius} />
                </g>
        }
        protected getRadius(node: SNode) {
            return 40
        }
    }

    const container = new Container()
    container.load(defaultModule, selectModule, moveModule)

    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', PolylineEdgeView)
    const decorators = container.getAll<IVNodeDecorator>(TYPES.IVNodeDecorator)
    const context = container.get<ModelRendererFactory>(TYPES.ModelRendererFactory)(decorators)
    const factory = new SGraphFactory()

    it('render an empty graph', () => {
        const schema = {
            type: 'graph',
            id: 'mygraph',
            children: []
        }
        const graph = factory.createRoot(schema) as SGraph
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<svg class="graph"><g transform="scale(1) translate(0,0)"></g></svg>')
    })

    const node0 = {id: 'node0', type: 'node:circle', position: { x: 100, y: 100 } }
    const node1 = {id: 'node1', type: 'node:circle', position: { x: 200, y: 150 }, selected: true}
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'}
    const graph = factory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]}) as SGraph

    it('render a straight edge', () => {
        const view = new PolylineEdgeView()
        const vnode = view.render(graph.index.getById('edge0') as SEdge, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal(
            '<g><path class="edge" d="M 179.45575695328574,146.57595949221428 L 206.35286098493785,168.36969634746004" /></g>')
    })

    it('render a circle node', () => {
        const view = new CircleNodeView()
        const vnode = view.render(graph.index.getById('node0') as SNode, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<g><circle class="node" r="40" cx="40" cy="40" /></g>')
    })

    it('render a whole graph', () => {
        const vnode = context.renderElement(graph)
        const html: string = toHTML(vnode)
        const expectation = '<svg id="sprotty_graph" class="graph" tabindex="1002">'
            + '<g transform="scale(1) translate(0,0)">'
            +   '<g id="sprotty_node0" transform="translate(100, 100)">'
            +     '<circle class="node" r="40" cx="40" cy="40" />'
            +   '</g>'
            +   '<g id="sprotty_node1" class="selected" transform="translate(200, 150)">'
            +     '<circle class="node selected" r="40" cx="40" cy="40" />'
            +   '</g>'
            +   '<g id="sprotty_edge0">'
            +     '<path class="edge" d="M 179.45575695328574,146.57595949221428 L 206.35286098493785,168.36969634746004" />'
            +   '</g>'
            + '</g>'
            + '</svg>'
        for (let i = 0; i < html.length; ++i) {
            if (html.charAt(i) !== expectation.charAt(i)) {
                console.log('Different char at ' + i)
            }
        }
        expect(html).to.be.equal(expectation)
    })
})

describe('AnchorableView', () => {
    const factory = new SGraphFactory()
    const model = factory.createRoot({
        type: 'graph',
        id: 'graph',
        children: [
            {
                type: 'node',
                id: 'node1',
                position: { x: 10, y: 10 },
                size: { width: 10, height: 10 },
                children: [
                    {
                        type: 'port',
                        id: 'port1',
                        position: { x: 10, y: 4 },
                        size: { width: 2, height: 2 }
                    } as SPortSchema
                ]
            } as SNodeSchema,
            {
                type: 'node',
                id: 'node2',
                position: { x: 30, y: 10 },
                size: { width: 10, height: 10 },
                children: [
                    {
                        type: 'port',
                        id: 'port2',
                        position: { x: -2, y: 4 },
                        size: { width: 2, height: 2 }
                    } as SPortSchema
                ]
            } as SNodeSchema,
            {
                type: 'edge',
                id: 'edge1',
                sourceId: 'port1',
                targetId: 'port2'
            } as SEdgeSchema
        ]
    })
    const rectView = new RectangularNodeView()
    
    it('correctly translates edge source position', () => {
        const edge = model.index.getById('edge1') as SEdge
        const sourcePort = model.index.getById('port1') as SPort
        const refPoint = { x: 30, y: 15 }
        const translated = rectView.getTranslatedAnchor(sourcePort, refPoint, edge)
        expect(translated).to.deep.equal({ x: 22, y: 15, width: -1, height: -1 })
    })
    
    it('correctly translates edge target position', () => {
        const edge = model.index.getById('edge1') as SEdge
        const targetPort = model.index.getById('port2') as SPort
        const refPoint = { x: 20, y: 15 }
        const translated = rectView.getTranslatedAnchor(targetPort, refPoint, edge)
        expect(translated).to.deep.equal({ x: 28, y: 15, width: -1, height: -1 })
    })
    
    it('correctly translates edge source to target position', () => {
        const edge = model.index.getById('edge1') as SEdge
        const sourcePort = model.index.getById('port1') as SPort
        const targetPort = model.index.getById('port2') as SPort
        const refPoint = { x: 10, y: 5 }
        const translated = rectView.getTranslatedAnchor(targetPort, refPoint, sourcePort, 0, edge)
        expect(translated).to.deep.equal({ x: 28, y: 15, width: -1, height: -1 })
    })
})
