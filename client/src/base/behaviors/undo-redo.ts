import {Action} from "../intent/actions"
import {KeyListener} from "../view/key-tool"
import {SModelElement} from "../model/smodel"
import {isCtrlOrCmd} from "../../utils/utils"

export class UndoAction implements Action {
    static readonly KIND = 'undo'
    kind = UndoAction.KIND
}

export class RedoAction implements Action {
    static readonly KIND = 'redo'
    kind = RedoAction.KIND
}

export class UndoRedoKeyListener extends KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        if (isCtrlOrCmd(event) && event.keyCode == 90) {
            if (event.shiftKey)
                return [new RedoAction]
            else
                return [new UndoAction]
        }
        return []
    }
}