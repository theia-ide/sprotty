import {SGraphView, StraightEdgeView} from "./views"
import {SGraph, SEdge, SNode} from "../../graph/model/sgraph"
import {SGraphFactory} from "../model/sgraph-factory"
import {Viewer} from "../../base/view/viewer"
import {ViewRegistry} from "../../base/view/views"
import {CircleNodeView} from "../../../examples/circlegraph/src/views"
import {expect} from "chai"
const toHTML = require('snabbdom-to-html')

describe('graph views', () => {

    const viewer = new Viewer()
    const viewRegistry = new ViewRegistry()
    viewer.viewRegistry = viewRegistry
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)
    const context = {viewer: viewer}
    const factory = new SGraphFactory

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
        expect(html).to.be.equal('<svg id="mygraph" class="graph"><g transform="scale(1) translate(0,0)"></g></svg>')
    })

    const node0 = {id: 'node0', type: 'node:circle', x: 100, y: 100};
    const node1 = {id: 'node1', type: 'node:circle', x: 200, y: 150, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = factory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]}) as SGraph;

    it('render a straight edge', () => {
        const view = new StraightEdgeView()
        const vnode = view.render(graph.index.getById('edge0') as SEdge, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal(
            '<path id="edge0" class="edge" d="M 175.77708763999664,157.88854381999832 L 204.22291236000336,172.11145618000168" />')
    })

    it('render a circle node', () => {
        const view = new CircleNodeView()
        const vnode = view.render(graph.index.getById('node0') as SNode, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<g id="node0"><circle class="node" r="40" cx="40" cy="40" /><text class="text" x="40" y="47">0</text></g>')
    })

    it('render a whole graph', () => {
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal(
            '<svg id="graph" class="graph">'
            + '<g transform="scale(1) translate(0,0)">'
            +   '<g transform="translate(100, 100)"><g id="node0"><circle class="node" r="40" cx="40" cy="40" /><text class="text" x="40" y="47">0</text></g></g>'
            +   '<g transform="translate(200, 150)"><g id="node1" class="selected"><circle class="node selected" r="40" cx="40" cy="40" /><text class="text" x="40" y="47">1</text></g></g>'
            +   '<path id="edge0" class="edge" d="M 175.77708763999664,157.88854381999832 L 204.22291236000336,172.11145618000168" />'
            + '</g>' 
            + '</svg>')
    })
})
