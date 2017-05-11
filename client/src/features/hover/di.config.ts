import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { HoverListener, HoverFeedbackCommand, SetPopupModelCommand, PopupKeyboardListener } from "./hover"

const hoverModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(HoverFeedbackCommand)
    bind(TYPES.ICommand).toConstructor(SetPopupModelCommand)
    bind(TYPES.MouseListener).to(HoverListener)
    bind(TYPES.KeyListener).to(PopupKeyboardListener)
})

export default hoverModule
