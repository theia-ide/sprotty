/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TYPES, LocalModelSource } from "../../../src";
import createContainer from "./di.config";

export default function runMindmap() {
    const container = createContainer(false, 'sprotty');

    // Start with empty model
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);
    modelSource.setModel({
        type: 'mindmap',
        id: 'root'
    });
}
