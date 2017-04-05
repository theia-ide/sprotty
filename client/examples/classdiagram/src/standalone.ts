import { IActionDispatcher, SetModelAction, TYPES, ViewRegistry } from "../../../src/base"
import { SGraphFactory, SGraphView, StraightEdgeView } from "../../../src/graph"
import createContainer from "./di.config"
import { ClassNodeView } from "./views"
import { SCompartmentView, SLabelView } from "../../../src/graph/view/views"

export default function runClassDiagram() {
    const container = createContainer()

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:class', ClassNodeView)
    viewRegistry.register('label:heading', SLabelView)
    viewRegistry.register('label:text', SLabelView)
    viewRegistry.register('comp:comp', SCompartmentView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Initialize gmodel
    const modelFactory = container.get<SGraphFactory>(TYPES.IModelFactory)
    const node0 = {
        id: 'node0',
        type: 'node:class',
        x: 100, y: 100,
        layout: 'vbox',
        children: [
            {
                id: 'node0_classname',
                type: 'label:heading',
                text: 'Foo'
            },
            {
                id: 'node0_attrs',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node0_op2',
                        type: 'label:text',
                        text: 'name: string'
                    }
                ],
            },
            {
                id: 'node0_ops',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node0_op0',
                        type: 'label:text',
                        text: '+ foo(): integer'
                    }, {
                        id: 'node0_op1',
                        type: 'label:text',
                        text: '# bar(x: string): void'
                    }
                ],
            }
        ]
    };
    const graph = modelFactory.createRoot({id: 'graph', type: 'graph', children: [node0]});

    // Run
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    const action = new SetModelAction(graph);
    dispatcher.dispatch(action);

}
