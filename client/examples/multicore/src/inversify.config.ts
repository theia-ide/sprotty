import {ContainerModule, Container} from "inversify"
import {SModelFactory} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory"
import defaultModule from "../../../src/base/container-module"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(SModelFactory).to(ChipModelFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, multicoreModule)
    return container
}
