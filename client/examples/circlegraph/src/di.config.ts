import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry } from "../../../src/base"
import { SGraphFactory, SGraphView, StraightEdgeView } from "../../../src/graph"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule } from "../../../src/features"
import { CircleNodeView } from "./views"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope()
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, circlegraphModule)
    if (useWebsocket)
        container.rebind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    
    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    return container
}
