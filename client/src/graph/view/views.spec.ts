import {SGraphView, StraightEdgeView} from "./views"
import {SGraph, SEdge, SNode} from "../../graph/model/sgraph"
import {SGraphFactory} from "../model/sgraph-factory"
import {Viewer} from "../../base/view/viewer"
import {ViewRegistry} from "../../base/view/views"
import {CircleNodeView} from "../../../examples/circlegraph/src/views"
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

    it('empty graph', () => {
        const schema = {
            type: 'graph',
            id: 'mygraph',
            children: []
        }
        const graph = factory.createRoot(schema) as SGraph
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot()
    })

    const node0 = {id: 'node0', type: 'node:circle', x: 100, y: 100};
    const node1 = {id: 'node1', type: 'node:circle', x: 200, y: 150, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = factory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]}) as SGraph;

    it('straight edge', () => {
        const view = new StraightEdgeView()
        const vnode = view.render(graph.index.getById('edge0') as SEdge, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot()
    })

    it('circle node', () => {
        const view = new CircleNodeView()
        const vnode = view.render(graph.index.getById('node0') as SNode, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot()
    })

    it('graph', () => {
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot()
    })
})
