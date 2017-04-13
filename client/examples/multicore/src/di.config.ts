import { Container, ContainerModule } from "inversify"
import { defaultModule, ViewerOptions, TYPES, ViewRegistry } from "../../../src/base"
import { ChipModelFactory } from "./chipmodel-factory"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, selectModule, viewportModule } from "../../../src/features"
import { ProcessorView, CoreView, CrossbarView, ChannelView } from "./views"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope()
    rebind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
        baseDiv: 'sprotty-cores',
        boundsComputation: 'fixed'
    })
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, boundsModule, selectModule, viewportModule, multicoreModule)
    if (useWebsocket)
        container.rebind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    
    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('processor', ProcessorView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    return container
}
