import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { HoverMouseListener, PopupHoverMouseListener, HoverFeedbackCommand, SetPopupModelCommand, HoverKeyListener, HoverState } from "./hover"

const hoverModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(HoverFeedbackCommand)
    bind(TYPES.ICommand).toConstructor(SetPopupModelCommand)
    bind(TYPES.MouseListener).to(HoverMouseListener)
    bind(TYPES.PopupMouseListener).to(PopupHoverMouseListener)
    bind(TYPES.KeyListener).to(HoverKeyListener)
    bind<HoverState>(TYPES.HoverState).toConstantValue({
        hoverTimer: undefined,
        popupOpen: false,
        previousPopupElement: undefined
    })
})

export default hoverModule
