import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph"
import {ConsoleLogger} from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import defaultModule from "../../../src/base/container-module"
import {moveModule, resizeModule, selectModule, viewportModule, undoRedoModule} from "../../../src/features"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(SGraphFactory).inSingletonScope()
    bind(TYPES.DiagramServer).to(WebSocketDiagramServer).inSingletonScope()
    bind(WebSocketDiagramServer).toSelf().inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, resizeModule, undoRedoModule, viewportModule, circlegraphModule)
    return container
}
