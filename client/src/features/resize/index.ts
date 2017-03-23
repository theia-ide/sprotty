import {TYPES} from "../../base/types"
import {ContainerModule} from "inversify"
import {ResizeCommand} from "./resize"
import {Autosizer} from "./autosizer"

export * from './resize'

export const resizeModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(ResizeCommand)
    bind(TYPES.VNodeDecorator).to(Autosizer).inSingletonScope()
})

