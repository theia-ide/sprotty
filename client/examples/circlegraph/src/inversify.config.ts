import {ContainerModule, Container} from "inversify"
import {TYPES,  SModelFactory} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph";
import defaultModule from "../../../src/base/container-module"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(SModelFactory).to(SGraphFactory).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, circlegraphModule)
    return container
}
