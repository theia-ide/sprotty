/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "reflect-metadata";
import "mocha";
import { expect } from "chai";
import { SModelRootSchema } from "../../base/model/smodel";
import { ModelMatcher } from "./model-matching";

describe('ModelMatcher', () => {
    it('finds new elements', () => {
        const modelMatcher = new ModelMatcher();
        const left: SModelRootSchema = {
            type: 't',
            id: 'root'
        };
        const right: SModelRootSchema = {
            type: 't',
            id: 'root',
            children: [
                {
                    type: 't',
                    id: 'child1'
                },
                {
                    type: 't',
                    id: 'child2'
                }
            ]
        };
        const result = modelMatcher.match(left, right);
        expect(result).to.have.all.keys(['root', 'child1', 'child2']);
        expect(result.root.left).to.equal(left);
        expect(result.root.right).to.equal(right);
        expect(result.child1).to.deep.equal({
            right: {
                type: 't',
                id: 'child1'
            },
            rightParentId: 'root'
        });
        expect(result.child2).to.deep.equal({
            right: {
                type: 't',
                id: 'child2'
            },
            rightParentId: 'root'
        });
    });

    it('finds deleted elements', () => {
        const modelMatcher = new ModelMatcher();
        const left: SModelRootSchema = {
            type: 't',
            id: 'root',
            children: [
                {
                    type: 't',
                    id: 'child1'
                },
                {
                    type: 't',
                    id: 'child2'
                }
            ]
        };
        const right: SModelRootSchema = {
            type: 't',
            id: 'root'
        };
        const result = modelMatcher.match(left, right);
        expect(result).to.have.all.keys(['root', 'child1', 'child2']);
        expect(result.root.left).to.equal(left);
        expect(result.root.right).to.equal(right);
        expect(result.child1).to.deep.equal({
            left: {
                type: 't',
                id: 'child1'
            },
            leftParentId: 'root'
        });
        expect(result.child2).to.deep.equal({
            left: {
                type: 't',
                id: 'child2'
            },
            leftParentId: 'root'
        });
    });

    it('matches elements with equal id', () => {
        const modelMatcher = new ModelMatcher();
        const left: SModelRootSchema = {
            type: 't',
            id: 'root',
            children: [
                {
                    type: 't',
                    id: 'child1',
                    children: [
                        {
                            type: 't',
                            id: 'child2'
                        }
                    ]
                }
            ]
        };
        const right: SModelRootSchema = {
            type: 't',
            id: 'root',
            children: [
                {
                    type: 't',
                    id: 'child2',
                    children: [
                        {
                            type: 't',
                            id: 'child1'
                        }
                    ]
                }
            ]
        };
        const result = modelMatcher.match(left, right);
        expect(result).to.have.all.keys(['root', 'child1', 'child2']);
        expect(result.root.left).to.equal(left);
        expect(result.root.right).to.equal(right);
        expect(result.child1).to.deep.equal({
            left: {
                type: 't',
                id: 'child1',
                children: [
                    {
                        type: 't',
                        id: 'child2'
                    }
                ]
            },
            leftParentId: 'root',
            right: {
                type: 't',
                id: 'child1'
            },
            rightParentId: 'child2'
        });
        expect(result.child2).to.deep.equal({
            left: {
                type: 't',
                id: 'child2'
            },
            leftParentId: 'child1',
            right: {
                type: 't',
                id: 'child2',
                children: [
                    {
                        type: 't',
                        id: 'child1'
                    }
                ]
            },
            rightParentId: 'root'
        });
    });
});
