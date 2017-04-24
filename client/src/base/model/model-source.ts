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
import { EMPTY_ROOT, IModelFactory } from "./smodel-factory"

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

    protected currentRoot: SModelRootSchema = {
        type: 'NONE',
        id: 'ROOT'
    }

    get model(): SModelRootSchema {
        return this.currentRoot
    }

    set model(root: SModelRootSchema) {
        this.setModel(root)
    }

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
        if (this.viewerOptions.boundsComputation == 'dynamic')
            this.actionDispatcher.dispatch(new RequestBoundsAction(this.currentRoot))
        else
            this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
    }

    applyMatches(matches: Match[]): void {
        this.applyToModel(matches, this.currentRoot)
        const update = new UpdateModelAction()
        update.modelType = this.currentRoot.type
        update.modelId = this.currentRoot.id
        update.matches = matches
        this.actionDispatcher.dispatch(update)
    }

    protected applyToModel(matches: Match[], root: SModelRootSchema): void {
        const index = new SModelIndex()
        index.add(root)
        for (const match of matches) {
            let newElementInserted = false
            if (match.left !== undefined && match.leftParentId !== undefined) {
                const parent = index.getById(match.leftParentId)
                if (parent !== undefined && parent.children !== undefined) {
                    const i = parent.children.indexOf(match.left)
                    if (i >= 0) {
                        if (match.right !== undefined && match.leftParentId == match.rightParentId) {
                            parent.children.splice(i, 1, match.right)
                            newElementInserted = true
                        } else {
                            parent.children.splice(i, 1)
                        }
                    }
                    index.remove(match.left)
                }
            }
            if (!newElementInserted && match.right !== undefined && match.rightParentId !== undefined) {
                const parent = index.getById(match.rightParentId)
                if (parent !== undefined) {
                    if (parent.children === undefined)
                        parent.children = []
                    parent.children.push(match.right)
                }
            }
        }
    }

    addElements(elements: (SModelElementSchema | { element: SModelElementSchema, parentId: string })[]): void {
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
    }

    removeElements(elements: (string | { elementId: string, parentId: string })[]) {
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
        this.setModel(this.currentRoot)
    }

    protected handleComputedBounds(action: ComputedBoundsAction): void {
        const index = new SModelIndex()
        index.add(this.currentRoot)
        for (const b of action.bounds) {
            const element = index.getById(b.elementId)
            if (element !== undefined)
                this.applyBounds(element, b.newBounds)
        }
        this.actionDispatcher.dispatch(new UpdateModelAction(this.currentRoot))
    }

    protected applyBounds(element: SModelElementSchema, newBounds: Bounds) {
        const e = element as any
        e.position = { x: newBounds.x, y: newBounds.y }
        e.size = { width: newBounds.width, height: newBounds.height }
        e.revalidateBounds = false
    }
}
