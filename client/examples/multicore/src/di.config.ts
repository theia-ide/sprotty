import { Container, ContainerModule } from "inversify"
import { defaultModule, ViewerOptions, TYPES, ViewRegistry } from "../../../src/base"
import { ChipModelFactory } from "./chipmodel-factory"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, selectModule, viewportModule } from "../../../src/features"
import { ProcessorView, CoreView, CrossbarView, ChannelView } from "./views"
import { LocalModelSource } from "../../../src/local/local-model-source"

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
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
    
    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('processor', ProcessorView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    return container
}
