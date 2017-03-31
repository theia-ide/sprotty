import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { CenterCommand, CenterKeyboardListener, FitToScreenCommand } from "./center-fit"
import { ViewportCommand } from "./viewport"
import { ScrollMouseListener } from "./scroll"
import { ZoomMouseListener } from "./zoom"

const viewportModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(CenterCommand)
    bind(TYPES.ICommand).toConstructor(FitToScreenCommand)
    bind(TYPES.ICommand).toConstructor(ViewportCommand)
    bind(TYPES.KeyListener).to(CenterKeyboardListener)
    bind(TYPES.MouseListener).to(ScrollMouseListener)
    bind(TYPES.MouseListener).to(ZoomMouseListener)
})

export default viewportModule
