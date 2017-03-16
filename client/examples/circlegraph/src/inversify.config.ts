import {ContainerModule, Container} from "inversify"
import {TYPES,  SModelFactory} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph";
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc";
import defaultModule from "../../../src/base/container-module"

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(SModelFactory).to(SGraphFactory).inSingletonScope()
    let diagramServer: Promise<DiagramServer>
    bind(TYPES.DiagramServerProvider).toProvider<DiagramServer>((context) => {
        return () => {
            if (!diagramServer)
                diagramServer = connectDiagramServer('ws://localhost:62000')
            return diagramServer
        }
    })
})

export default () => {
    const container = new Container()
    container.load(defaultModule, circlegraphModule)
    return container
}
