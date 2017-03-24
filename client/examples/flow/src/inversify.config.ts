import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {ConsoleLogger} from "../../../src/utils"
import { FlowModelFactory } from "./flowmodel-factory"
import { WebSocketDiagramServer } from "../../../src/remote"
import defaultModule from "../../../src/base/container-module"
import {resizeModule, moveModule} from "../../../src/features"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(FlowModelFactory).inSingletonScope()
    bind(TYPES.DiagramServer).to(WebSocketDiagramServer).inSingletonScope()
    bind(WebSocketDiagramServer).toSelf().inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, moveModule, resizeModule, flowModule)
    return container
}
