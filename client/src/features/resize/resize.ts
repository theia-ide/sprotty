import {Action} from "../../base/intent/actions"
import {SModelElement, SModelRoot} from "../../base/model/smodel"
import {Dimension, Bounds} from "../../utils/geometry"
import {BehaviorSchema} from "../../base/model/behavior"
import {CommandExecutionContext, AbstractCommand} from "../../base/intent/commands"

export interface Sizeable extends BehaviorSchema, Dimension {
    autosize: boolean
    clientBounds?: Bounds
}

export function isSizeable(element: SModelElement | Sizeable): element is Sizeable {
    return 'autosize' in element
        && 'width' in element
        && 'height' in element
}

export class ResizeAction implements Action {
    readonly kind = ResizeCommand.KIND

    constructor(public readonly resizes: ElementResize[]) {
    }
}

export type ElementResize = {
    elementId: string
    newSize: Dimension
    newClientBounds?: Bounds
}

type ResolvedElementResize = {
    element: SModelElement & Sizeable
    oldSize: Dimension
    newSize: Dimension
    oldClientBounds?: Bounds
    newClientBounds?: Bounds
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
                    let oldClientBounds: Bounds | undefined
                    if (element.clientBounds) {
                        oldClientBounds = {...element.clientBounds}
                    }
                    this.resizes.push({
                        element: element,
                        oldSize: {
                            width: element.width,
                            height: element.height
                        },
                        newSize: resize.newSize,
                        oldClientBounds: oldClientBounds,
                        newClientBounds: resize.newClientBounds
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.width = resize.oldSize.width
                resize.element.height = resize.oldSize.height
                if (resize.oldClientBounds)
                    resize.element.clientBounds = {...resize.oldClientBounds}
                resize.element.autosize = true
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.width = resize.newSize.width
                resize.element.height = resize.newSize.height
                if (resize.newClientBounds)
                    resize.element.clientBounds = {...resize.newClientBounds}
                resize.element.autosize = false
            }
        )
        return root
    }

    isPushable(): boolean {
        return false
    }
}