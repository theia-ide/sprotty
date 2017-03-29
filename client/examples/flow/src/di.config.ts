import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES, defaultModule} from "../../../src/base"
import {ConsoleLogger} from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import {boundsModule, moveModule} from "../../../src/features"
import { FlowModelFactory } from "./flowmodel-factory"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.IModelFactory).to(FlowModelFactory).inSingletonScope()
    bind(TYPES.IDiagramServer).to(WebSocketDiagramServer).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, moveModule, boundsModule, flowModule)
    return container
}
