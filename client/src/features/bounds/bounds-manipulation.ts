import { Bounds, TransformMatrix } from "../../utils/geometry"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Action } from "../../base/intent/actions"
import { AbstractCommand, CommandExecutionContext } from "../../base/intent/commands"
import {BoundsAware, isSizeable, isBoundsInPageAware} from "./model"

export class SetBoundsAction implements Action {
    readonly kind = SetBoundsCommand.KIND

    constructor(public readonly resizes: ElementAndBounds[]) {
    }
}

export type ElementAndBounds = {
    elementId: string
    newBounds: Bounds
    newBoundsInPage?: Bounds
}

type ResolvedElementAndBounds = {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    oldBoundsInPage?: Bounds
    newBounds: Bounds
    newBoundsInPage?: Bounds
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
                    const oldBoundsInPage = (isBoundsInPageAware(element)) ? element.boundsInPage : undefined
                    this.resizes.push({
                        element: element,
                        oldBounds: element.bounds,
                        oldBoundsInPage: oldBoundsInPage,
                        newBounds: resize.newBounds,
                        newBoundsInPage: resize.newBoundsInPage
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
                if(isBoundsInPageAware(resize.element) && resize.oldBoundsInPage)
                    resize.element.boundsInPage = resize.oldBoundsInPage
                resize.element.autosize = true
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.bounds = resize.newBounds
                if(isBoundsInPageAware(resize.element) && resize.newBoundsInPage)
                    resize.element.boundsInPage = resize.newBoundsInPage
                resize.element.autosize = false
            }
        )
        return root
    }

    isPushable(): boolean {
        return false
    }
}