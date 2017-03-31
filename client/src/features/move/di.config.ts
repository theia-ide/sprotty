import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { MoveCommand, MoveMouseListener } from "./move"

const moveModule = new ContainerModule(bind => {
    bind(TYPES.MouseListener).to(MoveMouseListener)
    bind(TYPES.ICommand).toConstructor(MoveCommand)
})

export default moveModule
