import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph"
import {ConsoleLogger} from "../../../src/utils"
import defaultModule from "../../../src/base/container-module"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(SGraphFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, flowModule)
    return container
}
