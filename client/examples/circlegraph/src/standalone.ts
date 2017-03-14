import {EventLoop} from "../../../src/base/event-loop"
import {ActionDispatcher} from "../../../src/base/intent/action-dispatcher"
import {CommandStack} from "../../../src/base/intent/command-stack"
import {Viewer} from "../../../src/base/view/viewer"
import {MoveKind, MoveCommand, ElementMove, MoveAction} from "../../../src/base/intent/move"
import {SelectCommand, SelectKind} from "../../../src/base/intent/select"
import {GGraphView, StraightEdgeView} from "../../../src/graph/view/views"
import {CircleNodeView} from "./views"
import {SGraph, SNode, SEdge} from "../../../src/graph/model/sgraph"
import {SetModelAction} from "../../../src/base/intent/model-manipulation"
export default function runStandalone() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerCommand(MoveKind, MoveCommand)
    eventLoop.dispatcher.registerCommand(SelectKind, SelectCommand)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewRegistry
    viewComponentRegistry.register('graph', GGraphView)
    viewComponentRegistry.register('node:circle', CircleNodeView)
    viewComponentRegistry.register('edge:straight', StraightEdgeView)

    // Initialize gmodel
    const node0 = {id: 'node0', type: 'node:circle', x: 100, y: 100};
    const node1 = {id: 'node1', type: 'node:circle', x: 200, y: 150, selected: true};
    const edge0 = {id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1'};
    const graph = new SGraph({id: 'graph', type: 'graph', children: [node0, node1, edge0]});

    // Run
    const action = new SetModelAction(graph);
    eventLoop.dispatcher.dispatch(action);

    let count = 2

    function addNode() {
        graph.children.add(
            new SNode({
                id: 'node' + count,
                type: 'node:circle',
                x: Math.random() * 1024,
                y: Math.random() * 768
            }))
        graph.children.add(
            new SEdge({
                id: 'edge' + count,
                type: 'edge:straight',
                sourceId: 'node0',
                targetId: 'node' + count++
            }))
        eventLoop.dispatcher.dispatch(new SetModelAction(graph))
    }

    for (let i = 0; i < 200; ++i) {
        addNode()
    }

    // button behavior
    document.getElementById('addNode')!.addEventListener('click', () => {
        addNode()
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
