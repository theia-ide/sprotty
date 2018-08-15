/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { DiagramState, SModelRootSchema, SGraphSchema, IStateAwareModelProvider, SEdgeSchema } from "../../../src";

@injectable()
export class ModelProvider implements IStateAwareModelProvider {

    getModel(state?: DiagramState, currentRoot?: SModelRootSchema): SModelRootSchema {
        // Initialize model
        const node0 = {
            id: 'node0',
            type: 'node:class',
            expanded: false,
            position: {
                x: 100,
                y: 100
            },
            layout: 'vbox',
            children: [
                {
                    id: 'node0_header',
                    type: 'comp:header',
                    layout: 'hbox',
                    children: [
                        {
                            id: 'node0_icon',
                            type: 'icon',
                            layout: 'stack',
                            layoutOptions: {
                                hAlign: 'center',
                                resizeContainer: false
                            },
                            children: [
                                {
                                    id: 'node0_ticon',
                                    type: 'label:icon',
                                    text: 'C'
                                }
                            ]
                        },
                        {
                            id: 'node0_classname',
                            type: 'label:heading',
                            text: 'Foo'
                        }, {
                            id: 'node0_expand',
                            type: 'button:expand'
                        }
                    ]
                }
            ]
        };
        if (state !== undefined && state.expansionState.expandedElementIds.indexOf('node0') !== -1) {
            node0.expanded = true;
            node0.children.push({
                id: 'node0_attrs',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node0_op2',
                        type: 'label:text',
                        text: 'name: string'
                    }
                ],
            });
            node0.children.push({
                id: 'node0_ops',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node0_op0',
                        type: 'label:text',
                        text: '+ foo(): integer'
                    }, {
                        id: 'node0_op1',
                        type: 'label:text',
                        text: '# bar(x: string): void'
                    }
                ],
            });
        }
        const node1 = {
            id: 'node1',
            type: 'node:class',
            expanded: false,
            position: {
                x: 500,
                y: 200
            },
            layout: 'vbox',
            children: [
                {
                    id: 'node1_header',
                    type: 'comp:header',
                    layout: 'hbox',
                    children: [
                        {
                            id: 'node1_icon',
                            type: 'icon',
                            layout: 'stack',
                            layoutOptions: {
                                hAlign: 'center',
                                resizeContainer: false
                            },
                            children: [
                                {
                                    id: 'node1_ticon',
                                    type: 'label:icon',
                                    text: 'C'
                                },
                            ]
                        }, {
                        id: 'node1_classname',
                        type: 'label:heading',
                        text: 'Bar'
                    }, {
                        id: 'node1_expand',
                        type: 'button:expand'
                    }]
                }
            ]
        };
        if (state !== undefined && state.expansionState.expandedElementIds.indexOf('node1') !== -1) {
            node1.expanded = true;
            node1.children.push({
                id: 'node1_attrs',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node1_op2',
                        type: 'label:text',
                        text: 'name: string'
                    }
                ],
            });
            node1.children.push({
                id: 'node1_ops',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node1_op0',
                        type: 'label:text',
                        text: '+ foo(): Foo'
                    }

                ]
            });
        }
        const edge = {
            id: 'edge',
            type: 'edge:straight',
            sourceId: node0.id,
            targetId: node1.id
        } as SEdgeSchema;
        const graph: SGraphSchema = {
            id: 'graph',
            type: 'graph',
            children: [node0, node1, edge],
            layoutOptions: {
                hGap: 5,
                hAlign: 'left',
                paddingLeft: 7,
                paddingRight: 7,
                paddingTop: 7,
                paddingBottom: 7
            }
        };
        return graph;
    }
}
