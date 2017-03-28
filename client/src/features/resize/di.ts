import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { ResizeCommand } from "./resize"
import { Autosizer } from "./autosizer"

const resizeModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(ResizeCommand)
    bind(TYPES.VNodeDecorator).to(Autosizer).inSingletonScope()
})

export default resizeModule
