import {
    ActionDispatcher,
    MoveCommand,
    ElementMove,
    MoveAction,
    SelectCommand,
    SetModelAction,
    SelectAction,
    ActionHandlerRegistry,
    ViewRegistry,
    ResizeAction,
    ResizeCommand
} from "../../../src/base"
import {SGraphView, StraightEdgeView, SNode, SGraphFactory, SNodeSchema, SEdgeSchema} from "../../../src/graph"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"
import {ViewportAction, ViewportCommand} from "../../../src/base/behaviors/viewport"
import {SModelRootSchema} from "../../../src/base/model/smodel"
import {SelectMouseListener} from "../../../src/base/behaviors/select"
import {MouseTool} from "../../../src/base/view/mouse-tool"
import {MoveMouseListener} from "../../../src/base/behaviors/move"
import {ScrollMouseListener} from "../../../src/base/behaviors/scroll"
import {ZoomMouseListener} from "../../../src/base/behaviors/zoom"
import {UndoRedoKeyListener} from "../../../src/base/behaviors/undo-redo"
import {KeyTool} from "../../../src/base/view/key-tool"

export default function runStandalone() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    actionHandlerRegistry.registerCommand(MoveAction.KIND, MoveCommand)
    actionHandlerRegistry.registerCommand(SelectAction.KIND, SelectCommand)
    actionHandlerRegistry.registerCommand(ResizeAction.KIND, ResizeCommand)
    actionHandlerRegistry.registerCommand(ViewportAction.KIND, ViewportCommand)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Configure tools
    const mouseTool = container.get(MouseTool)
    mouseTool.register(new SelectMouseListener())
    mouseTool.register(new MoveMouseListener())
    mouseTool.register(new ScrollMouseListener())
    mouseTool.register(new ZoomMouseListener())

    const keyTool = container.get(KeyTool)
    keyTool.register(new UndoRedoKeyListener())

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
            x: Math.random() * 1024 - 512,
            y: Math.random() * 768 - 384,
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
    dispatcher.dispatch(new SetModelAction(graph))

    // button behaviors
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
                        x: Math.random() * 1024 - 512,
                        y: Math.random() * 768 - 384
                    }
                })
            }
        })
        dispatcher.dispatch(new MoveAction(nodeMoves, true))
        document.getElementById('graph')!.focus()
    })

}
