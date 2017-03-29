import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { SetBoundsCommand } from "./bounds-manipulation"
import { BoundsGrabber } from "./bounds-grabber"

const boundsModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SetBoundsCommand)
    bind(TYPES.VNodeDecorator).to(BoundsGrabber).inSingletonScope()
})

export default boundsModule
