import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { ElementFader } from "./fade"

const fadeModule = new ContainerModule(bind => {
    bind(TYPES.IVNodeDecorator).to(ElementFader).inSingletonScope()
})

export default fadeModule
