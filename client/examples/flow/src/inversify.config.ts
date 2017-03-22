import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {ConsoleLogger} from "../../../src/utils"
import defaultModule from "../../../src/base/container-module"
import { FlowModelFactory } from "./flowmodel-factory"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(FlowModelFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, flowModule)
    return container
}
