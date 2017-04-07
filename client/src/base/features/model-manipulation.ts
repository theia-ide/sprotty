import { injectable } from "inversify"
import { Action } from "../intent/actions"
import {
    SModelRoot, SModelRootSchema, SModelElement, SModelElementSchema, SChildElement, SModelIndex,
    SParentElement
} from "../model/smodel"
import { RESERVED_MODEL_PROPERTIES } from "../model/smodel-factory"
import { AbstractCommand, CommandExecutionContext } from "../intent/commands"
import { CompoundAnimation, Animation } from "../animations/animation"
import { ModelMatcher, MatchResult } from "./model-matching"
import { isFadeable } from "../../features/fade/model"
import { ResolvedElementFade, FadeAnimation } from "../../features/fade/fade"
import { isMoveable, isLocateable } from "../../features/move/model"
import { ResolvedElementMove, MoveAnimation } from "../../features/move/move"

export class SetModelAction implements Action {
    readonly kind = SetModelCommand.KIND
    modelType: string
    modelId: string

    constructor(public newRoot: SModelRootSchema) {
        this.modelType = newRoot.type
        this.modelId = newRoot.id
    }
}

@injectable()
export class SetModelCommand extends AbstractCommand {
    static readonly KIND = 'setModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
        super()
    }

    execute(element: SModelRoot, context: CommandExecutionContext) {
        this.oldRoot = element
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        return this.newRoot
    }

    undo(element: SModelRoot) {
        return this.oldRoot
    }

    redo(element: SModelRoot) {
        return this.newRoot
    }
}

export class RequestModelAction implements Action {
    static readonly KIND = 'requestModel'
    readonly kind = RequestModelAction.KIND

    constructor(public modelType?: string, public modelId?: string,
        public readonly options?: any) {
    }
}

export class UpdateModelAction implements Action {
    readonly kind = UpdateModelCommand.KIND
    modelType: string
    modelId: string
    newRoot?: SModelRootSchema
    animate?: boolean
}

@injectable()
export class UpdateModelCommand extends AbstractCommand {
    static readonly KIND = 'updateModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: UpdateModelAction) {
        super()
    }

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.oldRoot = root
        if (this.action.newRoot !== undefined) {
            if ((this.action.animate === undefined || this.action.animate) && root.id == this.action.newRoot.id) {
                this.newRoot = context.modelFactory.createRoot(root)
                return this.computeAnimation(this.newRoot, this.action.newRoot, context).start()
            } else {
                return context.modelFactory.createRoot(this.action.newRoot)
            }
        } else {
            // TODO invalidate the model
            this.newRoot = root
            return root
        }
    }

    protected computeAnimation(leftRoot: SModelRoot, rightRoot: SModelRootSchema, context: CommandExecutionContext): Animation {
        const matcher = new ModelMatcher()
        const matchResult = matcher.match(leftRoot, rightRoot)
        const elementsToInsert: SChildElement[] = []
        const fades: ResolvedElementFade[] = []
        const moves: Map<string, ResolvedElementMove> = new Map
        for (const id in matchResult) {
            const match = matchResult[id]
            if (match.left !== undefined && match.right !== undefined) {
                // The element is still there, but may have been modified
                const original = match.left as SModelElement
                if (original instanceof SChildElement && match.leftParentId != match.rightParentId) {
                    original.parent.remove(original)
                    elementsToInsert.push(original)
                }
                if (isMoveable(original) && isLocateable(match.right)) {
                    const leftPos = original.position
                    const rightPos = match.right.position
                    if (leftPos.x != rightPos.x || leftPos.y != rightPos.y) {
                        moves.set(original.id, {
                            element: original,
                            elementId: original.id,
                            fromPosition: { x: leftPos.x, y: leftPos.y },
                            toPosition: rightPos
                        })
                    }
                }
                this.copyProperties(match.left, match.right)
            } else if (match.right !== undefined) {
                // An element has been added
                const newElement = context.modelFactory.createElement(match.right)
                elementsToInsert.push(newElement)
                if (isFadeable(newElement)) {
                    newElement.alpha = 0
                    fades.push({
                        element: newElement,
                        type: 'in'
                    })
                }
            } else if (match.left !== undefined) {
                // An element has been removed
                const removedElement = match.left as SModelElement
                if (isFadeable(removedElement)) {
                    fades.push({
                        element: removedElement,
                        type: 'out'
                    })
                } else if (removedElement instanceof SChildElement) {
                    removedElement.parent.remove(removedElement)
                }
            }
        }
        this.insertOrphans(elementsToInsert, matchResult, leftRoot.index)
        const animation = new CompoundAnimation(context)
        if (fades.length > 0)
            animation.include(new FadeAnimation(fades, context, true))
        if (Object.keys(moves).length > 0)
            animation.include(new MoveAnimation(leftRoot, moves, context, false))
        return animation;
    }

    protected copyProperties(left: SModelElementSchema, right: SModelElementSchema): void {
        for (let key in right) {
            if (RESERVED_MODEL_PROPERTIES.indexOf(key) < 0 && key in right) {
                const value: any = (right as any)[key]
                if (typeof value != 'function')
                    (left as any)[key] = value
            }
        }
    }

    protected insertOrphans(elementsToInsert: SChildElement[], matchResult: MatchResult, index: SModelIndex): void {
        while (elementsToInsert.length > 0) {
            for (let i = 0; i < elementsToInsert.length; i++) {
                const element = elementsToInsert[i]
                const match = matchResult[element.id]
                if (match.rightParentId === undefined)
                    throw new Error('Illegal state')
                const parent = index.getById(match.rightParentId)
                if (parent !== undefined) {
                    (parent as SParentElement).add(element)
                    elementsToInsert.splice(i, 1)
                }
            }
        }
    }

    undo(element: SModelRoot) {
        return this.oldRoot
    }

    redo(element: SModelRoot) {
        return this.newRoot
    }
}
