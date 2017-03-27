import {ContainerModule} from "inversify"
import {MoveMouseListener, MoveCommand} from "./move"
import {TYPES} from "../../base/types"

export * from './move'

export const moveFeature = Symbol('moveFeature')

export const moveModule = new ContainerModule(bind => {
    bind(TYPES.MouseListener).to(MoveMouseListener)
    bind(TYPES.ICommand).toConstructor(MoveCommand)
})
