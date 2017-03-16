import {TYPES, DefaultContainerFactory, ViewerOptions} from "../../../src/base"
import {SGraphFactory} from "../../../src/graph";
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc";

export default class CirclegraphContainerFactory extends DefaultContainerFactory {
    protected bindSModelFactory() {
        this.container.bind(TYPES.SModelFactory).to(SGraphFactory).inSingletonScope()
    }
    private diagramServer?: Promise<DiagramServer>
    protected bindDiagramServerProvider() {
        this.container.bind(TYPES.DiagramServerProvider).toProvider<DiagramServer>((context) => {
            return () => {
                if (!this.diagramServer)
                    this.diagramServer = connectDiagramServer('ws://localhost:62000')
                return this.diagramServer
            }
        })
    }
}
