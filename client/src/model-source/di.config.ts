/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../base/types";
import { ModelSource } from "./model-source";

/**
 * This container module does NOT provide any binding for TYPES.ModelSource because that needs to be
 * done according to the needs of the application. You can choose between a local (LocalModelSource)
 * and a remote (e.g. WebSocketDiagramServer) implementation.
 */
const modelSourceModule = new ContainerModule(bind => {
    bind(TYPES.ModelSourceProvider).toProvider<ModelSource>((context) => {
        return () => {
            return new Promise<ModelSource>((resolve) => {
                resolve(context.container.get<ModelSource>(TYPES.ModelSource));
            });
        };
    });
});

export default modelSourceModule;
