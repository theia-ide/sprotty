/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "reflect-metadata";
import runStandalone from "./circlegraph/src/standalone";
import runClassDiagram from "./classdiagram/src/standalone";
import runMindmap from "./mindmap/src/standalone";
import runSvgPreRendered from "./svg/src/standalone";
import runFlowServer from "./flow/src/flow-server";
import runMulticore from "./multicore/src/multicore";
import runMulticoreServer from "./multicore/src/multicore-server";
import runMulticoreFlowCombined from "./multicore/src/multicore-flow";

const appMode = document.getElementById('sprotty-app')!.getAttribute('data-app');

if (appMode === 'circlegraph')
    runStandalone();
else if (appMode === 'class-diagram')
    runClassDiagram();
else if (appMode === 'mindmap')
    runMindmap();
else if (appMode === 'svg')
    runSvgPreRendered();
else if (appMode === 'flow-server')
    runFlowServer();
else if (appMode === 'multicore')
    runMulticore();
else if (appMode === 'multicore-server')
    runMulticoreServer();
else if (appMode === 'multicore-flow')
    runMulticoreFlowCombined();
else
    throw new Error('Dunno what to do :-(');
