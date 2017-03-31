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
    element: SModelElement
    oldBounds: Bounds
    newBounds: Bounds
}

abstract class AbstractSetBoundsCommand extends AbstractCommand {

    protected resizes: ResolvedElementAndBounds[] = []

    constructor(protected action: SetBoundsAction, protected boundsProperty: string) {
        super()
    }

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.resizes.forEach(
            resize => {
                const element = root.index.getById(resize.elementId)
                if (element && this.boundsProperty in element) {
                    this.resizes.push({
                        element: element,
                        oldBounds: (element as any)[this.boundsProperty],
                        newBounds: resize.newBounds,
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => (resize.element as any)[this.boundsProperty] = resize.oldBounds
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => (resize.element as any)[this.boundsProperty] = resize.newBounds
        )
        return root
    }

    isPushable(): boolean {
        return false
    }
}

export class SetBoundsCommand extends AbstractSetBoundsCommand {
    static readonly KIND: string  = 'setBounds'

    constructor(action: SetBoundsAction) {
        super(action, 'bounds')
    }
}

export class SetBoundsInPageCommand extends AbstractSetBoundsCommand {
    static readonly KIND: string  = 'setBoundsInPage'

    constructor(action: SetBoundsInPageAction) {
        super(action, 'boundsInPage')
    }
}