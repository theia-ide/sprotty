import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import * as snabbdom from "snabbdom-jsx"
import { Container } from "inversify"
import { VNode } from "snabbdom/vnode"
import { CircularNodeView } from "../../lib/views"
import { SEdge, SGraph, SNode } from "../model/sgraph"
import { RenderingContext, ViewRegistry } from "../../base/view/views"
import { Viewer, ModelRendererFactory } from "../../base/view/viewer"
import { TYPES } from "../../base/types"
import { SGraphFactory } from "../model/sgraph-factory"
import { SGraphView, StraightEdgeView } from "./views"
import defaultModule from "../../base/di.config"
import selectModule from "../../features/select/di.config"
import moveModule from "../../features/move/di.config"

const toHTML = require('snabbdom-to-html')
const JSX = {createElement: snabbdom.svg}

describe('graph views', () => {
    class CircleNodeView extends CircularNodeView {
        render(node: SNode, context: RenderingContext): VNode {
            const radius = this.getRadius(node)
            return <g key={node.id} id={node.id} >
                    <circle class-node={true} class-selected={node.selected} r={radius} cx={radius} cy={radius} />
                </g>
        }
        protected getRadius(node: SNode) {
            return 40
        }
    }

    const container = new Container()
    container.load(defaultModule, selectModule, moveModule)

    const viewer = container.getNamed<Viewer>(TYPES.IViewer, 'delegate')
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)
    const context = container.get<ModelRendererFactory>(TYPES.ModelRendererFactory)([])
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
        expect(html).to.be.equal('<svg id="mygraph" class="graph"><g transform="scale(1) translate(0,0)"></g></svg>')
    })

    const node0 = {id: 'node0', type: 'node:circle', position: { x: 100, y: 100 } }
    const node1 = {id: 'node1', type: 'node:circle', position: { x: 200, y: 150 }, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = factory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]}) as SGraph;

    it('render a straight edge', () => {
        const view = new StraightEdgeView()
        const vnode = view.render(graph.index.getById('edge0') as SEdge, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal(
            '<g id="edge0"><path class="edge" d="M 179.49969448243914,146.30667390896087 L 206.3723157897707,168.33946319554624" /></g>')
    })

    it('render a circle node', () => {
        const view = new CircleNodeView()
        const vnode = view.render(graph.index.getById('node0') as SNode, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<g id="node0"><circle class="node" r="40" cx="40" cy="40" /></g>')
    })

    it('render a whole graph', () => {
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal(
            '<svg id="graph" class="graph">'
            + '<g transform="scale(1) translate(0,0)">'
            +   '<g id="node0" transform="translate(100, 100)"><circle class="node" r="40" cx="40" cy="40" /></g>'
            +   '<g id="node1" class="selected" transform="translate(200, 150)"><circle class="node selected" r="40" cx="40" cy="40" /></g>'
            +   '<g id="edge0"><path class="edge" d="M 179.49969448243914,146.30667390896087 L 206.3723157897707,168.33946319554624" /></g>'
            + '</g>' 
            + '</svg>')
    })
})
