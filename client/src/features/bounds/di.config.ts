import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { SetBoundsCommand, SetBoundsInPageCommand } from "./bounds-manipulation"
import { BoundsGrabber } from "./bounds-grabber"
import { Layouter, LayoutRegistry } from "./layout"
import { LAYOUT_TYPES } from "./types"

const boundsModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SetBoundsCommand)
    bind(TYPES.ICommand).toConstructor(SetBoundsInPageCommand)
    bind(TYPES.VNodeDecorator).to(BoundsGrabber).inSingletonScope()
    bind(LAYOUT_TYPES.Layouter).to(Layouter).inSingletonScope()
    bind(LAYOUT_TYPES.LayoutRegistry).to(LayoutRegistry).inSingletonScope()
})

export default boundsModule
