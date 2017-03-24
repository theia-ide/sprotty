import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory"
import {ConsoleLogger} from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import defaultModule from "../../../src/base/container-module"
import {resizeModule, selectModule, viewportModule} from "../../../src/features"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(ChipModelFactory).inSingletonScope()
    bind(TYPES.DiagramServer).to(WebSocketDiagramServer).inSingletonScope()
    bind(WebSocketDiagramServer).toSelf().inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, resizeModule, selectModule, viewportModule, multicoreModule)
    return container
}
