/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

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
