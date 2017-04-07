import { BoundsAware, BoundsInPageAware, isBoundsAware, isBoundsInPageAware } from './model';
import { Bounds } from "../../utils/geometry"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Action } from "../../base/intent/actions"
import { AbstractCommand, CommandExecutionContext } from "../../base/intent/commands"

export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND

    constructor(public readonly resizes: ElementAndBounds[]) {
    }
}

export class SetBoundsInPageAction implements Action {
    readonly kind = SetBoundsInPageCommand.KIND

    constructor(public readonly resizes: ElementAndBounds[]) {
    }
}

export type ElementAndBounds = {
    elementId: string
    newBounds: Bounds
}

type ResolvedElementAndBounds = {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    newBounds: Bounds
}

type ResolvedElementAndBoundsInPage = {
    element: SModelElement & BoundsInPageAware
    oldBounds: Bounds
    newBounds: Bounds
}

export class SetBoundsCommand extends AbstractCommand {
    static readonly KIND: string  = 'setBounds'

    protected resizes: ResolvedElementAndBounds[] = []
    
    constructor(protected action: SetBoundsAction) {
        super()
    }

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.resizes.forEach(
            resize => {
                const element = root.index.getById(resize.elementId)
                if (element && isBoundsAware(element)) {
                    this.resizes.push({
                        element: element,
                        oldBounds: element.bounds,
                        newBounds: resize.newBounds,
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.bounds = resize.oldBounds
                resize.element.revalidateBounds = true
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.bounds = resize.newBounds
                resize.element.revalidateBounds = false
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

    protected resizes: ResolvedElementAndBoundsInPage[] = []
    
    constructor(protected action: SetBoundsInPageAction) {
        super()
    }

        execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.resizes.forEach(
            resize => {
                const element = root.index.getById(resize.elementId)
                if (element && isBoundsInPageAware(element)) {
                    this.resizes.push({
                        element: element,
                        oldBounds: element.boundsInPage,
                        newBounds: resize.newBounds,
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => resize.element.boundsInPage = resize.oldBounds
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => resize.element.boundsInPage = resize.newBounds
        )
        return root
    }

    isSystemCommand(): boolean {
        return true
    }
}