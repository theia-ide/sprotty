import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewerOptions, ViewRegistry } from "../../../src/base"
import { SGraphFactory, SGraphView, SLabelView, SCompartmentView, StraightEdgeView } from "../../../src/graph"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule } from "../../../src/features"
import { ClassNodeView } from "./views"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope()
    rebind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
        baseDiv: 'sprotty',
        boundsComputation: 'dynamic'
    })
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, circlegraphModule)
    if (useWebsocket)
        container.rebind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:class', ClassNodeView)
    viewRegistry.register('label:heading', SLabelView)
    viewRegistry.register('label:text', SLabelView)
    viewRegistry.register('comp:comp', SCompartmentView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    return container
}
