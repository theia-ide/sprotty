import {ContainerModule, Container} from "inversify"
import {TYPES,  SModelFactory} from "../../../src/base"
import {ChipModelFactory} from "./chipmodel-factory";
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc";
import defaultModule from "../../../src/base/container-module"

const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(SModelFactory).to(ChipModelFactory).inSingletonScope()
    let diagramServer: Promise<DiagramServer>
    bind(TYPES.DiagramServerProvider).toProvider<DiagramServer>((context) => {
        return () => {
            if (!diagramServer)
                diagramServer = connectDiagramServer('ws://localhost:8080/diagram')
            return diagramServer
        }
    })
})

export default () => {
    const container = new Container()
    container.load(defaultModule, multicoreModule)
    return container
}
