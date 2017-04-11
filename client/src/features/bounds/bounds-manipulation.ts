import { BoundsAware, BoundsInPageAware, isBoundsAware, isBoundsInPageAware } from './model';
import { Bounds } from "../../utils/geometry"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Action } from "../../base/intent/actions"
import { AbstractCommand, CommandExecutionContext } from "../../base/intent/commands"

export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND

    constructor(public bounds: ElementAndBounds[]) {
    }
}

export class SetBoundsInPageAction implements Action {
    readonly kind = SetBoundsInPageCommand.KIND

    constructor(public bounds: ElementAndBounds[]) {
    }
}

export class RequestBoundsAction implements Action {
    readonly kind = RequestBoundsCommand.KIND

    constructor(public root: SModelRoot) {
    }
}

export class ComputedBoundsAction implements Action {
    static readonly KIND = 'computedBounds'
    
    readonly kind = ComputedBoundsAction.KIND

    constructor(public bounds: ElementAndBounds[]) {
    }
}

export interface ElementAndBounds {
    elementId: string
    newBounds: Bounds
}

interface ResolvedElementAndBounds {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    newBounds: Bounds
}

interface ResolvedElementAndBoundsInPage {
    element: SModelElement & BoundsInPageAware
    oldBounds: Bounds
    newBounds: Bounds
}

export class SetBoundsCommand extends AbstractCommand {
    static readonly KIND: string  = 'setBounds'

    protected bounds: ResolvedElementAndBounds[] = []
    
    constructor(protected action: SetBoundsAction) {
        super()
    }

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.bounds.forEach(
            b => {
                const element = root.index.getById(b.elementId)
                if (element && isBoundsAware(element)) {
                    this.bounds.push({
                        element: element,
                        oldBounds: element.bounds,
                        newBounds: b.newBounds,
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.bounds.forEach(
            b => {
                b.element.bounds = b.oldBounds
                b.element.revalidateBounds = true
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.bounds.forEach(
            b => {
                b.element.bounds = b.newBounds
                b.element.revalidateBounds = false
            }
        )
        return root
    }

    isSystemCommand(): boolean {
        return true
    }
}

export class SetBoundsInPageCommand extends AbstractCommand {
    static readonly KIND: string  = 'setBoundsInPage'

    protected bounds: ResolvedElementAndBoundsInPage[] = []
    
    constructor(protected action: SetBoundsInPageAction) {
        super()
    }

        execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.bounds.forEach(
            b => {
                const element = root.index.getById(b.elementId)
                if (element && isBoundsInPageAware(element)) {
                    this.bounds.push({
                        element: element,
                        oldBounds: element.boundsInPage,
                        newBounds: b.newBounds,
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.boundsInPage = b.oldBounds
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.bounds.forEach(
            b => b.element.boundsInPage = b.newBounds
        )
        return root
    }

    isSystemCommand(): boolean {
        return true
    }
}

export class RequestBoundsCommand extends AbstractCommand {
    static readonly KIND: string  = 'requestBounds'
    
    constructor(protected action: RequestBoundsAction) {
        super()
    }

    execute(element: SModelRoot, context: CommandExecutionContext): SModelRoot | Promise<SModelRoot> {
        return context.modelFactory.createRoot(this.action.root)
    }
    
    undo(element: SModelRoot, context: CommandExecutionContext): SModelRoot | Promise<SModelRoot> {
        // Nothing to undo
        return element
    }

    redo(element: SModelRoot, context: CommandExecutionContext): SModelRoot | Promise<SModelRoot> {
        // Nothing to redo
        return element
    }

    isSystemCommand(): boolean {
        return true
    }

    isHiddenCommand(): boolean {
        return true
    }
}
