import {EventLoop} from "../../../src/base"
import {
    ActionDispatcher,
    CommandStack,
    MoveCommand,
    ElementMove,
    MoveAction,
    SelectCommand,
    SetModelAction
} from "../../../src/base/intent"
import {Viewer} from "../../../src/base/view"
import {GGraphView, StraightEdgeView} from "../../../src/graph/view"
import {SNode, SGraphFactory, SNodeSchema, SEdgeSchema} from "../../../src/graph/model"
import {CircleNodeView} from "./views"
import {SelectAction} from "../../../src/base/intent/select"
import {ResizeAction, ResizeCommand} from "../../../src/base/intent/resize"

export default function runStandalone() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(new SGraphFactory()),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerCommand(MoveAction.KIND, MoveCommand)
    eventLoop.dispatcher.registerCommand(SelectAction.KIND, SelectCommand)
    eventLoop.dispatcher.registerCommand(ResizeAction.KIND, ResizeCommand)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewRegistry
    viewComponentRegistry.register('graph', GGraphView)
    viewComponentRegistry.register('node:circle', CircleNodeView)
    viewComponentRegistry.register('edge:straight', StraightEdgeView)

    // Initialize gmodel
    const modelFactory = new SGraphFactory()
    const node0 = {id: 'node0', type: 'node:circle', x: 100, y: 100};
    const node1 = {id: 'node1', type: 'node:circle', x: 200, y: 150, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = modelFactory.createRoot({id: 'graph', type: 'graph', children: [node0, node1, edge0]});

    // Run
    const action = new SetModelAction(graph);
    eventLoop.dispatcher.dispatch(action);

    let count = 2

    function addNode() {
        const newNode: SNodeSchema = {
            id: 'node' + count,
            type: 'node:circle',
            x: Math.random() * 1024,
            y: Math.random() * 768,
            width: 40
        }
        graph.add(modelFactory.createElement(newNode))
        const newEdge: SEdgeSchema = {
            id: 'edge' + count,
            type: 'edge:straight',
            sourceId: 'node0',
            targetId: 'node' + count++
        }
        graph.add(modelFactory.createElement(newEdge))
    }

    for (let i = 0; i < 200; ++i) {
        addNode()
    }
    eventLoop.dispatcher.dispatch(new SetModelAction(graph))

    // button behavior
    document.getElementById('addNode')!.addEventListener('click', () => {
        addNode()
        eventLoop.dispatcher.dispatch(new SetModelAction(graph))
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
        eventLoop.dispatcher.dispatch(new MoveAction(nodeMoves, true))
        document.getElementById('graph')!.focus()
    })

}
