/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { LocalModelSource, TYPES, SModelRootSchema, ShapedPreRenderedElementSchema } from "../../../src";
import createContainer from "./di.config";

function loadFile(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', path);
        request.addEventListener('load', () => {
            resolve(request.responseText);
        });
        request.addEventListener('error', (event) => {
            reject(event);
        });
        request.send();
    });
}

export default function runMulticore() {
    const p1 = loadFile('images/SVG_logo.svg');
    const p2 = loadFile('images/Ghostscript_Tiger.svg');
    Promise.all([p1, p2]).then(([svgLogo, tiger]) => {
        const container = createContainer();

        // Initialize model
        const model: SModelRootSchema = {
            type: 'svg',
            id: 'root',
            children: [
                {
                    type: 'pre-rendered',
                    id: 'logo',
                    position: { x: 200, y: 200 },
                    code: svgLogo
                } as ShapedPreRenderedElementSchema,
                {
                    type: 'pre-rendered',
                    id: 'tiger',
                    position: { x: 400, y: 0 },
                    code: tiger
                } as ShapedPreRenderedElementSchema
            ]
        };

        // Run
        const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);
        modelSource.setModel(model);
    });
}
