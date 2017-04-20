import { isEmpty } from '../../utils/geometry';
import { injectable } from "inversify"
import { Action } from "../intent/actions"
import {
    SModelRoot, SModelRootSchema, SModelElement, SModelElementSchema, SChildElement, SModelIndex,
    SParentElement
} from "../model/smodel"
import { Command, CommandExecutionContext, CommandResult } from '../intent/commands';
import { CompoundAnimation, Animation } from "../animations/animation"
import { ModelMatcher, MatchResult } from "./model-matching"
import { isFadeable } from "../../features/fade/model"
import { ResolvedElementFade, FadeAnimation } from "../../features/fade/fade"
import { isLocateable } from "../../features/move/model"
import { ResolvedElementMove, MoveAnimation } from "../../features/move/move"
import { isBoundsAware } from "../../features/bounds/model"
import { ViewportRootElement } from "../../features/viewport/viewport-root"

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
export class SetModelCommand extends Command {
    static readonly KIND = 'setModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: SetModelAction) {
        super()
    }

    execute(context: CommandExecutionContext): SModelRoot {
        this.oldRoot = context.root
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
        if(!isEmpty(this.oldRoot.canvasBounds)) {
           this.newRoot.canvasBounds = this.oldRoot.canvasBounds 
        }
        return this.newRoot
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return this.oldRoot
    }

    redo(context: CommandExecutionContext): SModelRoot {
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

    // TODO support a match result as alternative (or additional?) parameter
    constructor(public newRoot: SModelRootSchema, public animate?: boolean) {
        this.modelType = newRoot.type
        this.modelId = newRoot.id
    }
}

export interface UpdateAnimationData {
    fades: ResolvedElementFade[]
    moves?: ResolvedElementMove[]
}

@injectable()
export class UpdateModelCommand extends Command {
    static readonly KIND = 'updateModel'

    oldRoot: SModelRoot
    newRoot: SModelRoot

    constructor(public action: UpdateModelAction) {
        super()
    }

    execute(context: CommandExecutionContext): CommandResult {
        this.oldRoot = context.root
        if (this.action.newRoot !== undefined) {
            this.newRoot = context.modelFactory.createRoot(this.action.newRoot)
            if ((this.action.animate === undefined || this.action.animate) && context.root.id == this.action.newRoot.id) {
                const animationOrRoot = this.computeAnimation(this.oldRoot, this.newRoot, context)
                if (animationOrRoot instanceof Animation)
                    return animationOrRoot.start()
                else
                    return animationOrRoot
            } else {
                return this.newRoot
            }
        } else {
            // TODO invalidate the model
            this.newRoot = context.root
            return this.newRoot
        }
    }

    protected computeAnimation(leftRoot: SModelRoot, rightRoot: SModelRoot, context: CommandExecutionContext): SModelRoot | Animation {
        const matcher = new ModelMatcher()
        const matchResult = matcher.match(leftRoot, rightRoot)

        const animationData: UpdateAnimationData = {
            fades: [] as ResolvedElementFade[]
        }
        for (const id in matchResult) {
            const match = matchResult[id]
            if (match.left !== undefined && match.right !== undefined) {
                // The element is still there, but may have been moved
                this.updateElement(match.left as SModelElement, match.right as SModelElement, animationData)
            } else if (match.right !== undefined) {
                // An element has been added
                const right = match.right as SModelElement
                if (isFadeable(right)) {
                    right.opacity = 0
                    animationData.fades.push({
                        element: right,
                        type: 'in'
                    })
                }
            } else if (match.left instanceof SChildElement) {
                // An element has been removed
                const left = match.left
                if (isFadeable(left) && match.leftParentId !== undefined) {
                    const parent = rightRoot.index.getById(match.leftParentId)
                    if (parent instanceof SParentElement) {
                        parent.add(left)
                        animationData.fades.push({
                            element: left,
                            type: 'out'
                        })
                    }
                }
            }
        }

        const animations = this.createAnimations(animationData, rightRoot, context)
        if (animations.length >= 2) {
            return new CompoundAnimation(rightRoot, context, animations)
        } else if (animations.length == 1) {
            return animations[0]
        } else {
            return rightRoot
        }
    }

    protected updateElement(left: SModelElement, right: SModelElement, animationData: UpdateAnimationData): void {
        if (isLocateable(left) && isLocateable(right)) {
            const leftPos = left.position
            const rightPos = right.position
            if (leftPos.x != rightPos.x || leftPos.y != rightPos.y) {
                if (animationData.moves === undefined)
                    animationData.moves = []
                animationData.moves.push({
                    element: right,
                    elementId: right.id,
                    fromPosition: leftPos,
                    toPosition: rightPos
                })
                right.position = leftPos
            }
        }
        if (isBoundsAware(left) && isBoundsAware(right)) {
            if (right.bounds.width < 0 || right.bounds.height < 0) {
                right.bounds = {
                    x: right.bounds.x,
                    y: right.bounds.y,
                    width: left.bounds.width,
                    height: left.bounds.height
                }
                right.revalidateBounds = left.revalidateBounds
            }
        }
        if (left instanceof SModelRoot && right instanceof SModelRoot) {
            right.canvasBounds = left.canvasBounds
        }
        if (left instanceof ViewportRootElement && right instanceof ViewportRootElement) {
            right.scroll = left.scroll
            right.zoom = left.zoom
        }
    }

    protected createAnimations(data: UpdateAnimationData, root: SModelRoot, context: CommandExecutionContext): Animation[] {
        const animations: Animation[] = []
        if (data.fades.length > 0) {
            animations.push(new FadeAnimation(root, data.fades, context, true))
        }
        if (data.moves !== undefined && data.moves.length > 0) {
            const movesMap: Map<string, ResolvedElementMove> = new Map
            for (const move of data.moves) {
                movesMap.set(move.elementId, move)
            }
            animations.push(new MoveAnimation(root, movesMap, context, false))
        }
        return animations
    }

    undo(context: CommandExecutionContext): SModelRoot {
        return this.oldRoot
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return this.newRoot
    }
}
