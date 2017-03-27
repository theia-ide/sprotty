import {TYPES} from "../../base/types"
import {ContainerModule} from "inversify"
import {SelectCommand, SelectKeyboardListener, SelectMouseListener} from "./select"

export * from './select'

export const selectFeature = Symbol('selectFeature')

export const selectModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SelectCommand)
    bind(TYPES.KeyListener).to(SelectKeyboardListener)
    bind(TYPES.MouseListener).to(SelectMouseListener)
})
