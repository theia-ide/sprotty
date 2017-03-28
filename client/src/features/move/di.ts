import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { MoveMouseListener, MoveCommand } from "./move"

const moveModule = new ContainerModule(bind => {
    bind(TYPES.MouseListener).to(MoveMouseListener)
    bind(TYPES.ICommand).toConstructor(MoveCommand)
})

export default moveModule
