import { Container, ContainerModule } from "inversify"
import { defaultModule, IViewerOptions, TYPES } from "../../../src/base"
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
    rebind<IViewerOptions>(TYPES.IViewerOptions).toConstantValue({
        baseDiv: 'sprotty-flow'
    })
    bind(TYPES.IDiagramServer).to(WebSocketDiagramServer).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, flowModule)
    return container
}
