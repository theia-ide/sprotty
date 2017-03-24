import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph"
import {ConsoleLogger} from "../../../src/utils"
import defaultModule from "../../../src/base/container-module"
import {moveModule} from "../../../src/features/move/index"
import {resizeModule} from "../../../src/features/resize/index"
import {selectModule} from "../../../src/features/select/index"
import {viewportModule} from "../../../src/features/viewport/index"
import {undoRedoModule} from "../../../src/features/undo-redo/index"
import {makeLoggerMiddleware} from 'inversify-logger-middleware'

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(SGraphFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.applyMiddleware(makeLoggerMiddleware())
    container.load(defaultModule, selectModule, moveModule, resizeModule, undoRedoModule, viewportModule, circlegraphModule)
    return container
}
