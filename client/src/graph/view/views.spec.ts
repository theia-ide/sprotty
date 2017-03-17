import {SGraphView} from "./views"
import {SGraph} from "../../graph/model/sgraph"
import {SGraphFactory} from "../model/sgraph-factory"
import {Viewer} from "../../base/view/viewer"
const toHTML = require('snabbdom-to-html')

describe('base views', () => {

    const context = {viewer: new Viewer()}
    const factory = new SGraphFactory

    it('graph view', () => {
        const schema = {
            type: 'graph',
            id: 'mygraph',
            children: []
        }
        const graph = factory.createRoot(schema) as SGraph
        const view = new SGraphView()
        const vnode = view.render(graph, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot(html)
    })
})
