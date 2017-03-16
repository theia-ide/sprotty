import {TYPES, DefaultContainerFactory, ViewerOptions} from "../../../src/base"
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc";
import {ChipModelFactory} from "./chipmodel-factory";

export default class MulticoreContainerFactory extends DefaultContainerFactory {
    protected bindSModelFactory() {
        this.container.bind(TYPES.SModelFactory).to(ChipModelFactory).inSingletonScope()
    }
    private diagramServer?: Promise<DiagramServer>
    protected bindDiagramServerProvider() {
        this.container.bind(TYPES.DiagramServerProvider).toProvider<DiagramServer>((context) => {
            return () => {
                if (!this.diagramServer)
                    this.diagramServer = connectDiagramServer('ws://localhost:8080/diagram')
                return this.diagramServer
            }
        })
    }
}
