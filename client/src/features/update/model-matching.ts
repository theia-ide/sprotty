/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelRootSchema, SModelElementSchema, SModelRoot, SModelIndex, SModelElement, isParent } from '../../base/model/smodel';

export interface Match {
    left?: SModelElementSchema
    right?: SModelElementSchema
    leftParentId?: string
    rightParentId?: string
}

export interface MatchResult {
    [id: string]: Match
}

export function forEachMatch(matchResult: MatchResult, callback: (id: string, match: Match) => void): void {
    for (const id in matchResult) {
        if (matchResult.hasOwnProperty(id))
            callback(id, matchResult[id]);
    }
}

export class ModelMatcher {
    match(left: SModelRootSchema | SModelRoot, right: SModelRootSchema | SModelRoot): MatchResult {
        const result: MatchResult = {};
        this.matchLeft(left, result);
        this.matchRight(right, result);
        return result;
    }

    protected matchLeft(element: SModelElementSchema | SModelElement, result: MatchResult, parentId?: string): void {
        let match = result[element.id];
        if (match !== undefined) {
            match.left = element;
            match.leftParentId = parentId;
        } else {
            match = {
                left: element,
                leftParentId: parentId
            };
            result[element.id] = match;
        }
        if (isParent(element)) {
            for (const child of element.children) {
                this.matchLeft(child, result, element.id);
            }
        }
    }

    protected matchRight(element: SModelElementSchema | SModelElement, result: MatchResult, parentId?: string) {
        let match = result[element.id];
        if (match !== undefined) {
            match.right = element;
            match.rightParentId = parentId;
        } else {
            match = {
                right: element,
                rightParentId: parentId
            };
            result[element.id] = match;
        }
        if (isParent(element)) {
            for (const child of element.children) {
                this.matchRight(child, result, element.id);
            }
        }
    }
}

export function applyMatches(root: SModelRootSchema, matches: Match[]): void {
    let index: SModelIndex<SModelElementSchema>;
    if (root instanceof SModelRoot) {
        index = root.index;
    } else {
        index = new SModelIndex();
        index.add(root);
    }
    for (const match of matches) {
        let newElementInserted = false;
        if (match.left !== undefined && match.leftParentId !== undefined) {
            const parent = index.getById(match.leftParentId);
            if (parent !== undefined && parent.children !== undefined) {
                const i = parent.children.indexOf(match.left);
                if (i >= 0) {
                    if (match.right !== undefined && match.leftParentId === match.rightParentId) {
                        parent.children.splice(i, 1, match.right);
                        newElementInserted = true;
                    } else {
                        parent.children.splice(i, 1);
                    }
                }
                index.remove(match.left);
            }
        }
        if (!newElementInserted && match.right !== undefined && match.rightParentId !== undefined) {
            const parent = index.getById(match.rightParentId);
            if (parent !== undefined) {
                if (parent.children === undefined)
                    parent.children = [];
                parent.children.push(match.right);
            }
        }
    }
}
