/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { configureModelElement } from "../../base/views/view";
import { ContainerModule } from "inversify";
import { SIssueMarker } from "./model";
import { IssueMarkerView } from "./views";
import { TYPES } from "../../base/types";
import { DecorationPlacer } from "./decoration-placer";

const decorationModule = new ContainerModule(bind => {
    configureModelElement({bind}, 'marker', SIssueMarker, IssueMarkerView);
    bind(DecorationPlacer).toSelf().inSingletonScope();
    bind(TYPES.IVNodeDecorator).toService(DecorationPlacer);
});

export default decorationModule;
