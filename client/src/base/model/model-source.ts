import { inject, injectable } from "inversify"
import { TYPES } from "../types"
import { Action, ActionHandler, ActionHandlerRegistry } from "../intent/actions"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { Command } from "../intent/commands"
import { SetModelAction, SetModelCommand, UpdateModelAction, UpdateModelCommand, RequestModelAction } from "../features/model-manipulation"
import { FitToScreenAction } from "../../features/viewport/center-fit"
import { ComputedBoundsAction } from "../../features/bounds/bounds-manipulation"
import { IViewerOptions } from "../view/options"
import { Bounds } from "../../utils/geometry"
import { SModelRootSchema, SModelElementSchema, SModelIndex } from "./smodel"
import { initializeIndex } from "./smodel-factory"

@injectable()
export abstract class ModelSource implements ActionHandler {

    constructor(@inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.IViewerOptions) viewerOptions: IViewerOptions) {
        this.initialize(actionHandlerRegistry, viewerOptions)
    }

    initialize(registry: ActionHandlerRegistry, viewerOptions: IViewerOptions): void {
        // Register model manipulation commands
        registry.registerCommand(SetModelCommand)
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        registry.register(RequestModelAction.KIND, this)
        if (viewerOptions.boundsComputation == 'dynamic') {
            registry.register(ComputedBoundsAction.KIND, this)
        }
    }

    abstract handle(action: Action): Command | Action | void
}

@injectable()
export class LocalModelSource extends ModelSource {

    protected currentRoot?: SModelRootSchema

    setModel(root: SModelRootSchema): void {
        this.currentRoot = root
        this.actionDispatcher.dispatch(new SetModelAction(root))
        this.postModelUpdate()
    }

    updateModel(newRoot?: SModelRootSchema, animate: boolean = true): void {
        if (newRoot !== undefined) {
            this.currentRoot = newRoot
            this.actionDispatcher.dispatch(new UpdateModelAction(newRoot, animate))
        } else if (this.currentRoot !== undefined) {
            // The model has been modified externally
            this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot, animate))
        } else {
            this.fireModelNotAvailable()
        }
        this.postModelUpdate()
    }

    protected postModelUpdate() {
        this.actionDispatcher.dispatch(new FitToScreenAction([]))
    }

    handle(action: Action): void {
        switch (action.kind) {
            case RequestModelAction.KIND:
                this.handleRequestModel(action as RequestModelAction)
                break;
            case ComputedBoundsAction.KIND:
                this.handleComputedBounds(action as ComputedBoundsAction)
                break;
        }
    }

    handleRequestModel(action: RequestModelAction): void {
        if (this.currentRoot !== undefined)
            this.setModel(this.currentRoot)
        else
            this.fireModelNotAvailable()
    }

    handleComputedBounds(action: ComputedBoundsAction): void {
        if (this.currentRoot !== undefined) {
            const index = new SModelIndex()
            initializeIndex(this.currentRoot, index)
            for (const b of action.bounds) {
                const element = index.getById(b.elementId)
                if (element !== undefined) {
                    this.applyBounds(element, b.newBounds)
                }
            }
            this.updateModel()
        } else {
            this.fireModelNotAvailable()
        }
    }

    protected applyBounds(element: SModelElementSchema, newBounds: Bounds) {
        const e = element as any
        if (e.bounds !== undefined || e == this.currentRoot) {
            e.bounds = newBounds
        } else {
            e.x = newBounds.x
            e.y = newBounds.y
            e.width = newBounds.width
            e.height = newBounds.height
        }
        e.revalidateBounds = false
    }

    protected fireModelNotAvailable(): never {
        throw new Error('Model is not available')
    }
}
