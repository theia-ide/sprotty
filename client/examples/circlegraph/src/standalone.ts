import {
    ActionDispatcher,
    SetModelAction,
    ViewRegistry,
} from "../../../src/base"
import {SGraphView, StraightEdgeView, SNode, SGraphFactory, SNodeSchema, SEdgeSchema} from "../../../src/graph"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"
import {ElementMove, MoveAction} from "../../../src/features/move/move"

export default function runStandalone() {
    const container = createContainer()

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Initialize gmodel
    const modelFactory = new SGraphFactory()
    const node0 = {id: 'node0', type: 'node:circle', x: 100, y: 100};
    const node1 = {id: 'node1', type: 'node:circle', x: 200, y: 150, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = modelFactory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]});

    // Run
    const dispatcher = container.get(ActionDispatcher)
    const action = new SetModelAction(graph);
    dispatcher.dispatch(action);

    let count = 2

    function addNode() {
        const newNode: SNodeSchema = {
            id: 'node' + count,
            type: 'node:circle',
            x: Math.random() * 1024,
            y: Math.random() * 768,
            width: 40
        }
        const newEdge: SEdgeSchema = {
            id: 'edge' + count,
            type: 'edge:straight',
            sourceId: 'node0',
            targetId: 'node' + count++
        }
        graph.add(modelFactory.createElement(newNode), 0)
        graph.add(modelFactory.createElement(newEdge), 0)
    }

    for (let i = 0; i < 200; ++i) {
        addNode()
    }
    dispatcher.dispatch(new SetModelAction(graph))

    // button features
    document.getElementById('addNode')!.addEventListener('click', () => {
        addNode()
        dispatcher.dispatch(new SetModelAction(graph))
        document.getElementById('graph')!.focus()
    })

    document.getElementById('scrambleNodes')!.addEventListener('click', function (e) {
        const nodeMoves: ElementMove[] = []
        graph.children.forEach(shape => {
            if (shape instanceof SNode) {
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
