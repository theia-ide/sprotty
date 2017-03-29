import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { UndoRedoKeyListener } from "./undo-redo"

const undoRedoModule = new ContainerModule(bind => {
    bind(TYPES.KeyListener).to(UndoRedoKeyListener)
})

export default undoRedoModule
