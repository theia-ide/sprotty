import {Action} from "../../base/intent/actions"
import {SModelElement, SModelRoot} from "../../base/model/smodel"
import {Bounds, TransformMatrix} from "../../utils/geometry"
import {BehaviorSchema} from "../../base/model/behavior"
import {CommandExecutionContext, AbstractCommand} from "../../base/intent/commands"
import {resizeFeature} from "./index"
import {Locateable} from "../move/move"

export interface BoundsAware extends BehaviorSchema {
    autosize: boolean
    bounds: Bounds
}

export function isSizeable(element: SModelElement): element is SModelElement & BoundsAware {
    return element.hasFeature(resizeFeature)
}

export function isBoundsAware(element: SModelElement): element is SModelElement & BoundsAware {
    return 'bounds' in element
}

export class ResizeAction implements Action {
    readonly kind = ResizeCommand.KIND

    constructor(public readonly resizes: ElementResize[]) {
    }
}

export type ElementResize = {
    elementId: string
    newBounds: Bounds
}

type ResolvedElementResize = {
    element: SModelElement & BoundsAware
    oldBounds: Bounds
    newBounds: Bounds
}

export class ResizeCommand extends AbstractCommand {
    static readonly KIND = 'resize'

    private resizes: ResolvedElementResize[] = []

    constructor(private action: ResizeAction) {
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
                console.log(JSON.stringify(resize.element.bounds))
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