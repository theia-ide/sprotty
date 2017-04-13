import { Container, ContainerModule } from "inversify"
import { defaultModule, ViewerOptions, TYPES, ViewRegistry } from "../../../src/base"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, fadeModule } from "../../../src/features"
import { FlowModelFactory } from "./flowmodel-factory"
import viewportModule from "../../../src/features/viewport/di.config"
import selectModule from "../../../src/features/select/di.config"
import { SGraphView } from "../../../src/graph"
import { ExecutionNodeView, BarrierNodeView, FlowEdgeView } from "./views"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(FlowModelFactory).inSingletonScope()
    rebind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
        baseDiv: 'sprotty-flow',
        boundsComputation: 'dynamic'
    })
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, flowModule)
    if (useWebsocket)
        container.rebind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    
    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('flow', SGraphView)
    viewRegistry.register('task', ExecutionNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', FlowEdgeView)

    return container
}
