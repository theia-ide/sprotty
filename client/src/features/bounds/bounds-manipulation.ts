import { Bounds, TransformMatrix } from "../../utils/geometry"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Action } from "../../base/intent/actions"
import { AbstractCommand, CommandExecutionContext } from "../../base/intent/commands"
import { BoundsAware, isSizeable } from "./model"

export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND

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

export class SetBoundsCommand extends AbstractCommand {
    static readonly KIND = 'bounds'

    protected resizes: ResolvedElementAndBounds[] = []

    constructor(protected action: SetBoundsAction) {
        super()
    }

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.resizes.forEach(
            resize => {
                const element = root.index.getById(resize.elementId)
                if (element && isSizeable(element)) {
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
                resize.element.autosize = true
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.bounds = resize.newBounds
                resize.element.autosize = false
            }
        )
        return root
    }

    isPushable(): boolean {
        return false
    }
}