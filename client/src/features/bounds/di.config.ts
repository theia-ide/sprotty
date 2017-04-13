import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { SetBoundsCommand, RequestBoundsCommand } from "./bounds-manipulation"
import { HiddenBoundsUpdater } from './bounds-updater';
import { Layouter, LayoutRegistry } from "./layout"
import { LAYOUT_TYPES } from "./types"

const boundsModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SetBoundsCommand)
    bind(TYPES.ICommand).toConstructor(RequestBoundsCommand)
    bind(TYPES.HiddenVNodeDecorator).to(HiddenBoundsUpdater).inSingletonScope()
    bind(LAYOUT_TYPES.Layouter).to(Layouter).inSingletonScope()
    bind(LAYOUT_TYPES.LayoutRegistry).to(LayoutRegistry).inSingletonScope()
})

export default boundsModule
