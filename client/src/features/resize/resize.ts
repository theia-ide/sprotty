import {Action} from "../../base/intent/actions"
import {SModelElement, SModelRoot} from "../../base/model/smodel"
import {Dimension, Bounds, TransformMatrix} from "../../utils/geometry"
import {BehaviorSchema} from "../../base/model/behavior"
import {CommandExecutionContext, AbstractCommand} from "../../base/intent/commands"
import {resizeFeature} from "./index"

export interface Sizeable extends BehaviorSchema, Dimension {
    autosize: boolean
    boundingBox?: Bounds
    clientBounds?: Bounds
    currentTransformMatrix?: TransformMatrix
}

export function isSizeable(element: SModelElement): element is SModelElement & Sizeable {
    return element.hasFeature(resizeFeature)
        &&'autosize' in element
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
    newCurrentTransformMatrix?: TransformMatrix
}

type ResolvedElementResize = {
    element: SModelElement & Sizeable
    oldSize: Dimension
    newSize: Dimension
    oldClientBounds?: Bounds
    newClientBounds?: Bounds
    oldCurrentTransformMatrix?: TransformMatrix,
    newCurrentTransformMatrix?: TransformMatrix
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
                    let oldCurrentTransformMatrix: TransformMatrix | undefined
                    if (element.currentTransformMatrix) {
                        oldCurrentTransformMatrix = {...element.currentTransformMatrix}
                    }
                    this.resizes.push({
                        element: element,
                        oldSize: {
                            width: element.width,
                            height: element.height
                        },
                        newSize: resize.newSize,
                        oldClientBounds: oldClientBounds,
                        newClientBounds: resize.newClientBounds,
                        oldCurrentTransformMatrix: oldCurrentTransformMatrix,
                        newCurrentTransformMatrix: resize.newCurrentTransformMatrix
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
                if (resize.oldCurrentTransformMatrix)
                    resize.element.currentTransformMatrix = {...resize.oldCurrentTransformMatrix}
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
                if (resize.newCurrentTransformMatrix)
                    resize.element.currentTransformMatrix = {...resize.newCurrentTransformMatrix}
                resize.element.autosize = false
            }
        )
        return root
    }

    isPushable(): boolean {
        return false
    }
}