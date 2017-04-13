import { TYPES, ViewRegistry, LocalModelSource } from "../../../src/base"
import { SGraphSchema, SGraphView, StraightEdgeView } from "../../../src/graph"
import { ClassNodeView } from "./views"
import { SCompartmentView, SLabelView } from "../../../src/graph/view/views"
import createContainer from "./di.config"

export default function runClassDiagram() {
    const container = createContainer(false)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:class', ClassNodeView)
    viewRegistry.register('label:heading', SLabelView)
    viewRegistry.register('label:text', SLabelView)
    viewRegistry.register('comp:comp', SCompartmentView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Initialize model
    const node0 = {
        id: 'node0',
        type: 'node:class',
        bounds: {
            x: 100,
            y: 100,
            width: -1,
            height: -1
        },
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
    const graph: SGraphSchema = { id: 'graph', type: 'graph', children: [node0] }

    // Run
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
    modelSource.setModel(graph)
}
