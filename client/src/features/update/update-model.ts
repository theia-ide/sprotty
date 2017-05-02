import { Animation, CompoundAnimation } from '../../base/animations/animation';
import { Command, CommandExecutionContext, CommandResult } from '../../base/intent/commands';
import { FadeAnimation, ResolvedElementFade } from '../fade/fade'
import { Action } from '../../base/intent/actions'
import { SModelRootSchema, SModelRoot, SChildElement, SModelElement, SParentElement } from "../../base/model/smodel"
import { MoveAnimation, ResolvedElementMove } from "../move/move"
import { MatchResult, ModelMatcher, Match } from "./model-matching";
import { Fadeable, isFadeable } from "../fade/model"
import { isLocateable } from "../move/model"
import { isBoundsAware } from "../bounds/model"
import { ViewportRootElement } from "../viewport/viewport-root"
import { injectable } from "inversify"
import { isEmpty } from "../../utils/geometry";

export class UpdateModelAction implements Action {
    readonly kind = UpdateModelCommand.KIND
    modelType: string
    modelId: string
    newRoot?: SModelRootSchema
    matches?: Match[]
    animate?: boolean = true

    constructor(newRoot?: SModelRootSchema) {
        if (newRoot !== undefined) {
            this.modelType = newRoot.type
            this.modelId = newRoot.id
            this.newRoot = newRoot
        }
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
        if (action.animate === undefined)
            action.animate = true
    }

    execute(context: CommandExecutionContext): CommandResult {
        let newRoot: SModelRoot
        if (this.action.newRoot !== undefined) {
            newRoot = context.modelFactory.createRoot(this.action.newRoot)
        } else {
            newRoot = context.modelFactory.createRoot(context.root)
            if (this.action.matches !== undefined)
                this.applyMatches(newRoot, this.action.matches, context)
        }
        this.oldRoot = context.root
        this.newRoot = newRoot
        return this.performUpdate(this.oldRoot, this.newRoot, context)
    }

    protected performUpdate(oldRoot: SModelRoot, newRoot: SModelRoot, context: CommandExecutionContext): CommandResult {
        if (this.action.animate && oldRoot.id == newRoot.id) {
            let matchResult: MatchResult
            if (this.action.matches === undefined) {
                const matcher = new ModelMatcher()
                matchResult = matcher.match(oldRoot, newRoot)
            } else {
                matchResult = this.convertToMatchResult(this.action.matches, oldRoot, newRoot)
            }
            const animationOrRoot = this.computeAnimation(newRoot, matchResult, context)
            if (animationOrRoot instanceof Animation)
                return animationOrRoot.start()
            else
                return animationOrRoot
        } else {
            return newRoot
        }
    }

    protected applyMatches(root: SModelRoot, matches: Match[], context: CommandExecutionContext): void {
        const index = root.index
        for (const match of matches) {
            if (match.left !== undefined) {
                const element = index.getById(match.left.id)
                if (element instanceof SChildElement)
                    element.parent.remove(element)
            }
            if (match.right !== undefined) {
                const element = context.modelFactory.createElement(match.right)
                let parent: SModelElement | undefined
                if (match.rightParentId !== undefined)
                    parent = index.getById(match.rightParentId)
                if (parent instanceof SParentElement)
                    parent.add(element)
                else
                    root.add(element)
            }
        }
    }

    protected convertToMatchResult(matches: Match[], leftRoot: SModelRoot, rightRoot: SModelRoot): MatchResult {
        const result: MatchResult = {}
        for (const match of matches) {
            const converted: Match = {}
            let id: string | undefined = undefined
            if (match.left !== undefined) {
                id = match.left.id
                converted.left = leftRoot.index.getById(id)
                converted.leftParentId = match.leftParentId
            }
            if (match.right !== undefined) {
                id = match.right.id
                converted.right = rightRoot.index.getById(id)
                converted.rightParentId = match.rightParentId
            }
            if (id !== undefined)
                result[id] = converted
        }
        return result
    }

    protected computeAnimation(newRoot: SModelRoot, matchResult: MatchResult, context: CommandExecutionContext): SModelRoot | Animation {
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
                    const parent = newRoot.index.getById(match.leftParentId)
                    if (parent instanceof SParentElement) {
                        const leftCopy = context.modelFactory.createElement(left) as SChildElement & Fadeable
                        parent.add(leftCopy)
                        animationData.fades.push({
                            element: leftCopy,
                            type: 'out'
                        })
                    }
                }
            }
        }

        const animations = this.createAnimations(animationData, newRoot, context)
        if (animations.length >= 2) {
            return new CompoundAnimation(newRoot, context, animations)
        } else if (animations.length == 1) {
            return animations[0]
        } else {
            return newRoot
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
        if (isBoundsAware(left) && isBoundsAware(right) && isEmpty(right.bounds)) {
            right.bounds = {
                x: right.bounds.x,
                y: right.bounds.y,
                width: left.bounds.width,
                height: left.bounds.height
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

    undo(context: CommandExecutionContext): CommandResult {
        return this.performUpdate(this.newRoot, this.oldRoot, context)
    }

    redo(context: CommandExecutionContext): CommandResult {
        return this.performUpdate(this.oldRoot, this.newRoot, context)
    }
}
