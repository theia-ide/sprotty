import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { SelectCommand, SelectKeyboardListener, SelectMouseListener } from "./select"

const selectModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SelectCommand)
    bind(TYPES.KeyListener).to(SelectKeyboardListener)
    bind(TYPES.MouseListener).to(SelectMouseListener)
})

export default selectModule
