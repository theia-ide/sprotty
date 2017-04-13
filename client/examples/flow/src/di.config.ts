import { Container, ContainerModule } from "inversify"
import { defaultModule, ViewerOptions, TYPES } from "../../../src/base"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, fadeModule } from "../../../src/features"
import { FlowModelFactory } from "./flowmodel-factory"
import viewportModule from "../../../src/features/viewport/di.config"
import selectModule from "../../../src/features/select/di.config"

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
    return container
}
