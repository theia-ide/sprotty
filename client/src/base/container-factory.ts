import {Container, interfaces} from "inversify"
import {DiagramServerProvider} from "../jsonrpc";
import {
    ActionDispatcher, CommandStack, ActionHandlerRegistry, RequestActionHandler, NotificationActionHandler,
    IActionHandler
} from "./intent";
import {Viewer, ViewRegistry, ViewerOptions} from "./view";
import {SModelFactory} from "./model";
import {TYPES} from "./types";

export class DefaultContainerFactory {

    private _container: Container

    constructor(container?: Container) {
        if (container)
            this._container = container
        else
            this._container = new Container()
    }

    protected get container(): Container {
        return this._container
    }

    make(): Container {
        this.bindActionDispatcher()
        this.bindActionDispatcherProvider()
        this.bindCommandStack()
        this.bindCommandStackProvider()
        this.bindViewer()
        this.bindViewerProvider()
        this.bindViewerOptions()
        this.bindActionHandlerRegistry()
        this.bindViewRegistry()
        this.bindSModelFactory()
        this.bindRequestActionHandlerFactory()
        this.bindNotificationActionHandlerFactory()
        this.bindDiagramServerProvider()
        return this.container
    }

    protected bindActionDispatcher() {
        this.container.bind(ActionDispatcher).toSelf().inSingletonScope()
    }

    protected bindActionDispatcherProvider() {
        this.container.bind(TYPES.ActionDispatcherProvider).toProvider<ActionDispatcher>((context) => {
            return () => {
                return new Promise<ActionDispatcher>((resolve) => {
                    resolve(context.container.get(ActionDispatcher))
                })
            }
        })
    }

    protected bindCommandStack() {
        this.container.bind(CommandStack).toSelf().inSingletonScope()
        this.container.bind(TYPES.ICommandStack).to(CommandStack).inSingletonScope()
    }

    protected bindCommandStackProvider() {
        this.container.bind(TYPES.CommandStackProvider).toProvider<CommandStack>((context) => {
            return () => {
                return new Promise<CommandStack>((resolve) => {
                    resolve(context.container.get(CommandStack))
                })
            }
        })
    }

    protected bindViewer() {
        this.container.bind(Viewer).toSelf().inSingletonScope()
        this.container.bind(TYPES.IViewer).to(Viewer).inSingletonScope()
    }

    protected bindViewerProvider() {
        this.container.bind(TYPES.ViewerProvider).toProvider<Viewer>((context) => {
            return () => {
                return new Promise<Viewer>((resolve) => {
                    resolve(context.container.get(Viewer))
                })
            }
        })
    }

    protected bindViewerOptions() {
        this.container.bind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
            baseDiv: 'sprotte'
        })
    }

    protected bindActionHandlerRegistry() {
        this.container.bind(ActionHandlerRegistry).toSelf().inSingletonScope()
    }

    protected bindViewRegistry() {
        this.container.bind(ViewRegistry).toSelf().inSingletonScope()
    }

    protected bindSModelFactory() {
        this.container.bind(SModelFactory).toSelf().inSingletonScope()
    }

    protected bindRequestActionHandlerFactory() {
        this.container.bind(TYPES.RequestActionHandlerFactory).toFactory<RequestActionHandler>((context: interfaces.Context) => {
            return (immediateHandler?: IActionHandler) => {
                const diagramServerProvider = context.container.get<DiagramServerProvider>(TYPES.DiagramServerProvider)
                const actionDispatcher = context.container.get(ActionDispatcher)
                return new RequestActionHandler(diagramServerProvider, actionDispatcher, immediateHandler)
            }
        })
    }

    protected bindNotificationActionHandlerFactory() {
        this.container.bind(TYPES.NotificationActionHandlerFactory).toFactory<NotificationActionHandler>((context: interfaces.Context) => {
            return (immediateHandler?: IActionHandler) => {
                const diagramServerProvider = context.container.get<DiagramServerProvider>(TYPES.DiagramServerProvider)
                const actionDispatcher = context.container.get(ActionDispatcher)
                return new NotificationActionHandler(diagramServerProvider, actionDispatcher, immediateHandler)
            }
        })
    }

    protected bindDiagramServerProvider() {
        // No default binding for the diagram server
    }

}
