import { SModelRootSchema, SModelElementSchema } from "../../base/model/smodel"

export interface Match {
    left?: SModelElementSchema
    right?: SModelElementSchema
    leftParentId?: string
    rightParentId?: string
}

export interface MatchResult {
    [id: string]: Match
}

export class ModelMatcher {
    match(left: SModelRootSchema, right: SModelRootSchema): MatchResult {
        const result: MatchResult = {}
        this.matchLeft(left, result)
        this.matchRight(right, result)
        return result
    }

    protected matchLeft(element: SModelElementSchema, result: MatchResult, parentId?: string): void {
        let match = result[element.id]
        if (match !== undefined) {
            match.left = element
            match.leftParentId = parentId
        } else {
            match = {
                left: element,
                leftParentId: parentId
            }
            result[element.id] = match
        }
        if (element.children !== undefined) {
            for (const child of element.children) {
                this.matchLeft(child, result, element.id)
            }
        }
    }

    protected matchRight(element: SModelElementSchema, result: MatchResult, parentId?: string) {
        let match = result[element.id]
        if (match !== undefined) {
            match.right = element
            match.rightParentId = parentId
        } else {
            match = {
                right: element,
                rightParentId: parentId
            }
            result[element.id] = match
        }
        if (element.children !== undefined) {
            for (const child of element.children) {
                this.matchRight(child, result, element.id)
            }
        }
    }
}
