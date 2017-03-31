import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES } from "../../../src/base"
import { SGraphFactory } from "../../../src/graph"
import { ConsoleLogger } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule } from "../../../src/features"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope()
    bind(TYPES.IDiagramServer).to(WebSocketDiagramServer).inSingletonScope()
})

export default () => {
    const container = new Container()
    // container.applyMiddleware(makeLoggerMiddleware())
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, circlegraphModule)
    return container
}
