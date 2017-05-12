import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry, overrideViewerOptions } from "../../../src/base"
import { SGraphFactory, SGraphView, SLabelView, SCompartmentView, PolylineEdgeView } from "../../../src/graph"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule, hoverModule } from "../../../src/features"
import { ClassNodeView } from "./views"
import { LocalModelSource } from "../../../src/local/local-model-source"
import { ClassDiagramFactory } from "./model-factory"
import { HtmlRootView, PreRenderedView } from "../../../src/lib"

const classDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(ClassDiagramFactory).inSingletonScope()
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, hoverModule, classDiagramModule)
    if (useWebsocket)
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
    overrideViewerOptions(container, {
        boundsComputation: 'dynamic'
    })

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:class', ClassNodeView)
    viewRegistry.register('label:heading', SLabelView)
    viewRegistry.register('label:text', SLabelView)
    viewRegistry.register('comp:comp', SCompartmentView)
    viewRegistry.register('edge:straight', PolylineEdgeView)
    viewRegistry.register('html', HtmlRootView)
    viewRegistry.register('pre-rendered', PreRenderedView)

    return container
}
