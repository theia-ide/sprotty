import { TYPES, IActionDispatcher, ViewRegistry, LocalModelSource } from "../../../src/base"
import { SEdgeSchema, SGraphView, SNode, SNodeSchema, StraightEdgeView, SGraphSchema, SGraphFactory } from "../../../src/graph"
import { ElementMove, MoveAction } from "../../../src/features"
import { CircleNodeView } from "./views"
import createContainer from "./di.config"

export default function runStandalone() {
    const container = createContainer(false)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Initialize gmodel
    const node0 = { id: 'node0', type: 'node:circle', bounds: { x: 100, y: 100, width: -1, height: -1 } }
    const node1 = { id: 'node1', type: 'node:circle', bounds: { x: 200, y: 150, width: -1, height: -1 }, selected: true }
    const edge0 = { id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1' }
    const graph: SGraphSchema = { id: 'graph', type: 'graph', children: [node0, node1, edge0] }

    let count = 2
    function addNode() {
        const newNode: SNodeSchema = {
            id: 'node' + count,
            type: 'node:circle',
            bounds: {
                x: Math.random() * 1024,
                y: Math.random() * 768,
                width: 40,
                height: 40
            }
        }
        const newEdge: SEdgeSchema = {
            id: 'edge' + count,
            type: 'edge:straight',
            sourceId: 'node0',
            targetId: 'node' + count++
        }
        graph.children.push(newNode)
        graph.children.push(newEdge)
    }

    for (let i = 0; i < 200; ++i) {
        addNode()
    }

    // Run
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
    modelSource.setModel(graph)

    // Button features
    /*
    This does not work at the moment. We need a more flexible UpdateModelCommand that
    can do partial updates.
    document.getElementById('addNode')!.addEventListener('click', () => {
        addNode()
        modelSource.setModel(graph)
        document.getElementById('graph')!.focus()
    })
    */

    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    const factory = container.get<SGraphFactory>(TYPES.IModelFactory)
    document.getElementById('scrambleNodes')!.addEventListener('click', function (e) {
        const nodeMoves: ElementMove[] = []
        graph.children.forEach(shape => {
            if (factory.isNodeSchema(shape)) {
                nodeMoves.push({
                    elementId: shape.id,
                    toPosition: {
                        x: Math.random() * 1024,
                        y: Math.random() * 768
                    }
                })
            }
        })
        dispatcher.dispatch(new MoveAction(nodeMoves, true))
        document.getElementById('graph')!.focus()
    })

}
