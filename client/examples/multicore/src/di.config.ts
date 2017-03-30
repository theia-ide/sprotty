import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES, IViewerOptions, defaultModule} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import {boundsModule, selectModule, viewportModule} from "../../../src/features"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope()
    rebind<IViewerOptions>(TYPES.IViewerOptions).toConstantValue({
        baseDiv: 'sprotty-cores'
    })
    bind(TYPES.IDiagramServer).to(WebSocketDiagramServer).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, boundsModule, selectModule, viewportModule, multicoreModule)
    return container
}
