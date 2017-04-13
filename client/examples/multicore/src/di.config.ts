import { Container, ContainerModule } from "inversify"
import { defaultModule, IViewerOptions, TYPES } from "../../../src/base"
import { ChipModelFactory } from "./chipmodel-factory"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, selectModule, viewportModule } from "../../../src/features"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope()
    rebind<IViewerOptions>(TYPES.IViewerOptions).toConstantValue({
        baseDiv: 'sprotty-cores',
        boundsComputation: 'fixed'
    })
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, boundsModule, selectModule, viewportModule, multicoreModule)
    if (useWebsocket)
        container.rebind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    return container
}
