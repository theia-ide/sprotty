/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TYPES, SEdge, SGraphSchema, LocalModelSource } from "../../../src"
import createContainer from "./di.config"

export default function runClassDiagram() {
    const container = createContainer(false, 'sprotty')

    // Initialize model
    const node0 = {
        id: 'node0',
        type: 'node:class',
        position: {
            x: 100,
            y: 100
        },
        layout: 'vbox',
        children: [
            {
                id: 'node0_classname',
                type: 'label:heading',
                text: 'Foo'
            },
            {
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
            },
            {
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
            }
        ]
    }
    const node1 = {
        id: 'node1',
        type: 'node:class',
        position: {
            x: 300,
            y: 100
        },
        layout: 'vbox',
        children: [
            {
                id: 'node1_classname',
                type: 'label:heading',
                text: 'Bar'
            },
            {
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
            },
            {
                id: 'node1_ops',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node1_op0',
                        type: 'label:text',
                        text: '+ foo(): Foo'
                    },
                    {
                        id: 'node1_op1',
                        type: 'label:text',
                        text: '+ bla(): Bla'
                    }

                ],
            }
        ]
    }
    const node2 = {
        id: 'node2',
        type: 'node:class',
        position: {
            x: 500,
            y: 200
        },
        layout: 'vbox',
        children: [
            {
                id: 'node2_classname',
                type: 'label:heading',
                text: 'Bla'
            },
            {
                id: 'node2_attrs',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node2_op2',
                        type: 'label:text',
                        text: 'name: string'
                    }
                ],
            },
            {
                id: 'node2_ops',
                type: 'comp:comp',
                layout: 'vbox',
                children: [
                    {
                        id: 'node2_op0',
                        type: 'label:text',
                        text: '+ talk(): string'
                    }

                ],
            }
        ]
    }
    const edge = {
        id: 'edge',
        type: 'edge:straight',
        sourceId: node0.id,
        targetId: node1.id
    } as SEdge
    const edge2 = {
        id: 'edge2',
        type: 'edge:straight',
        sourceId: node1.id,
        targetId: node2.id
    }
    const graph: SGraphSchema = { id: 'graph', type: 'graph', children: [node0, node1, node2, edge, edge2] }
    // Run
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
    modelSource.setModel(graph)
}
