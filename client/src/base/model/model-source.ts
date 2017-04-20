import { inject, injectable } from "inversify"
import { TYPES } from "../types"
import { Action, IActionHandler, ActionHandlerRegistry } from "../intent/actions"
import { IActionDispatcher } from "../intent/action-dispatcher"
import { ICommand } from "../intent/commands"
import { SetModelAction, SetModelCommand, UpdateModelAction, UpdateModelCommand, RequestModelAction } from "../features/model-manipulation"
import { FitToScreenAction } from "../../features/viewport/center-fit"
import { ComputedBoundsAction, RequestBoundsAction } from "../../features/bounds/bounds-manipulation"
import { ViewerOptions } from "../view/options"
import { Bounds } from "../../utils/geometry"
import { SModelRootSchema, SModelElementSchema, SModelIndex } from "./smodel"
import { Match } from "../features/model-matching"

/**
 * A model source is serving the model to the event cycle. It represents
 * the entry point to the client for external sources, such as model 
 * editors.
 * 
 * As an IActionHandler it listens to actions in and reacts to them with
 * commands or actions if necessary. This way, you can implement action
 * protocols between the client and the outside world.
 * 
 * There are two default implementations for a ModelSource:
 * <ul>
 * <li>the LocalModelSource handles the actions to calculate bounds and 
 * set/update the model</li>
 * <li>the DiagramServer connects via websocket to a remote source. It 
 * can be used to connect to a model editor that provides the model,
 * layouts diagrams, transfers selection and answers model queries from
 * the client.</li>
 */
@injectable()
export abstract class ModelSource implements IActionHandler {

    protected actionDispatcher: IActionDispatcher
    
    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions) {
        this.initialize(actionHandlerRegistry)
        this.actionDispatcher = actionDispatcher
    }

    initialize(registry: ActionHandlerRegistry): void {
        // Register model manipulation commands
        registry.registerCommand(SetModelCommand)
        registry.registerCommand(UpdateModelCommand)

        // Register this model source
        registry.register(RequestModelAction.KIND, this)
        if (this.viewerOptions.boundsComputation == 'dynamic') {
            registry.register(ComputedBoundsAction.KIND, this)
        }
    }

    abstract handle(action: Action): ICommand | Action | void
}

/**
 * A model source that handles actions for bounds calculation and model 
 * updates.
 */
@injectable()
export class LocalModelSource extends ModelSource {

    protected currentRoot?: SModelRootSchema

    setModel(root: SModelRootSchema): void {
        this.currentRoot = root
        if (this.viewerOptions.boundsComputation == 'dynamic') {
            this.actionDispatcher.dispatch(new RequestBoundsAction(root))
        } else {
            this.actionDispatcher.dispatch(new SetModelAction(root))
        }
    }

    updateModel(newRoot?: SModelRootSchema): void {
        if (newRoot !== undefined)
            this.currentRoot = newRoot
        if (this.currentRoot !== undefined) {
            if (this.viewerOptions.boundsComputation == 'dynamic')
                this.actionDispatcher.dispatch(new RequestBoundsAction(this.currentRoot))
            else
                this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
        } else {
            this.fireModelNotAvailable()
        }
    }

    applyMatches(matches: Match[]): void {
        if (this.currentRoot !== undefined) {
            const update = new UpdateModelAction()
            update.modelType = this.currentRoot.type
            update.modelId = this.currentRoot.id
            update.matches = matches
            this.actionDispatcher.dispatch(update)
        } else {
            this.fireModelNotAvailable()
        }
    }

    addElements(elements: (SModelElementSchema | { element: SModelElementSchema, parentId: string })[]): void {
        if (this.currentRoot !== undefined) {
            const matches: Match[] = []
            for (const i in elements) {
                const e: any = elements[i]
                if (e.element !== undefined && e.parentId !== undefined) {
                    matches.push({
                        right: e.element,
                        rightParentId: e.parentId
                    })
                } else if (e.id !== undefined) {
                    matches.push({
                        right: e,
                        rightParentId: this.currentRoot.id
                    })
                }
            }
            this.applyMatches(matches)
        } else {
            this.fireModelNotAvailable()
        }
    }

    removeElements(elements: (string | { elementId: string, parentId: string })[]) {
        if (this.currentRoot !== undefined) {
            const matches: Match[] = []
            const index = new SModelIndex()
            index.add(this.currentRoot)
            for (const i in elements) {
                const e: any = elements[i]
                if (e.elementId !== undefined && e.parentId !== undefined) {
                    const element = index.getById(e.elementId)
                    if (element !== undefined) {
                        matches.push({
                            left: element,
                            leftParentId: e.parentId
                        })
                    }
                } else {
                    const element = index.getById(e)
                    if (element !== undefined) {
                        matches.push({
                            left: element,
                            leftParentId: this.currentRoot.id
                        })
                    }
                }
            }
            this.applyMatches(matches)
        } else {
            this.fireModelNotAvailable()
        }
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

    protected handleRequestModel(action: RequestModelAction): void {
        if (this.currentRoot !== undefined)
            this.setModel(this.currentRoot)
        else
            this.fireModelNotAvailable()
    }

    protected handleComputedBounds(action: ComputedBoundsAction): void {
        if (this.currentRoot !== undefined) {
            const index = new SModelIndex()
            index.add(this.currentRoot)
            for (const b of action.bounds) {
                const element = index.getById(b.elementId)
                if (element !== undefined)
                    this.applyBounds(element, b.newBounds)
            }
            this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
        } else {
            this.fireModelNotAvailable()
        }
    }

    protected applyBounds(element: SModelElementSchema, newBounds: Bounds) {
        const e = element as any
        e.bounds = newBounds
        e.revalidateBounds = false
    }

    protected fireModelNotAvailable(): never {
        throw new Error('Model is not available')
    }
}
