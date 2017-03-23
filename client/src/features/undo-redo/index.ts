import {ContainerModule} from "inversify"
import {TYPES} from "../../base/types"
import {UndoRedoKeyListener} from "./undo-redo"

export * from './undo-redo'

export const undoRedoModule = new ContainerModule(bind => {
    bind(TYPES.KeyListener).to(UndoRedoKeyListener)
})
