import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry } from "../../../src/base"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { boundsModule, moveModule, selectModule, undoRedoModule, viewportModule, hoverModule } from "../../../src/features"
import { LocalModelSource } from "../../../src/local/local-model-source"
import { SvgFactory } from "./model-factory"
import { HtmlRootView, PreRenderedView } from "../../../src/lib"
import { SvgView } from "./views"

const svgModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(SvgFactory).inSingletonScope()
    bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, hoverModule, svgModule)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('svg', SvgView)
    viewRegistry.register('pre-rendered', PreRenderedView)

    return container
}
