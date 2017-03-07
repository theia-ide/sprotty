import {EventLoop} from "../base/EventLoop"
import {GGraphView, StraightEdgeView} from "../graph/Views"
import {CircleNodeView} from "./Views"
import {CommandStack} from "../base/intent/CommandStack"
import {ActionDispatcher} from "../base/intent/ActionDispatcher"
import {GGraph, GNode, GEdge} from "../graph/GModel"
import {MoveAction, MoveCommand, MoveKind, ElementMove} from "../base/intent/Move"
import {SetModelAction} from "../base/intent/SetModel"
import {SelectKind, SelectCommand} from "../base/intent/Select"
import {Viewer} from "../base/view/Viewer"

// init gmodel
const node0 = {id: 'node0', type: 'circle', x: 100, y: 100};
const node1 = {id: 'node1', type: 'circle', x: 200, y: 150, selected: true};
const edge0 = {id: 'edge0', type: 'straight', sourceId: 'node0', targetId: 'node1'};
const graph = new GGraph({id: 'graph', type: 'graph', shapes: [node0, node1, edge0]});

// setup event loop
const eventLoop = new EventLoop(
    new ActionDispatcher(),
    new CommandStack(),
    new Viewer()
);

eventLoop.dispatcher.commandRegistry.register(MoveKind, MoveCommand)
eventLoop.dispatcher.commandRegistry.register(SelectKind, SelectCommand)

// register views
const viewComponentRegistry = eventLoop.viewer.viewComponentRegistry
viewComponentRegistry.register('graph', GGraphView)
viewComponentRegistry.register('circle', CircleNodeView)
viewComponentRegistry.register('straight', StraightEdgeView)

// run
const action = new SetModelAction(graph);
eventLoop.dispatcher.dispatch(action);

let count = 2
function addNode(e) {
    graph.children.add(
        new GNode({
            id: 'node' + count,
            type: 'circle',
            x: Math.random() * 1024,
            y: Math.random() * 768
        }))
    graph.children.add(
        new GEdge({
            id: 'edge' + count,
            type: 'straight',
            sourceId: 'node0',
            targetId: 'node' + count++
        }))
    eventLoop.dispatcher.dispatch(new SetModelAction(graph))
}

for (let i = 0; i < 200; ++i) {
    addNode(null)
}

// button behavior
document.getElementById('addNode').addEventListener('click', () => {
    this.addNode()
    document.getElementById('graph').focus()
})

document.getElementById('scrambleNodes').addEventListener('click', function (e) {
    const nodeMoves: ElementMove[] = []
    graph.children.forEach(shape => {
        if (shape instanceof GNode) {
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
    document.getElementById('graph').focus()
})
