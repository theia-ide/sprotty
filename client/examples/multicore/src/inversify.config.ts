import {ContainerModule, Container} from "inversify"
import {SModelFactory, TYPES} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory"
import {ConsoleLogger} from "../../../src/utils"
import defaultModule from "../../../src/base/container-module"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
    rebind(SModelFactory).to(ChipModelFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, multicoreModule)
    return container
}
