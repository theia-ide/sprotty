import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { HoverListener, HoverCommand } from "./hover"

const hoverModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(HoverCommand)
    bind(TYPES.MouseListener).to(HoverListener)
})

export default hoverModule
