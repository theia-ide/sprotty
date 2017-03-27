import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory"
import {ConsoleLogger} from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import defaultModule from "../../../src/base/container-module"
import {resizeModule, selectModule, viewportModule} from "../../../src/features"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope()
    bind(TYPES.IDiagramServer).to(WebSocketDiagramServer).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, resizeModule, selectModule, viewportModule, multicoreModule)
    return container
}
