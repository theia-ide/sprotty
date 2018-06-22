/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { setupMulticore } from "./multicore-server";
import { setupFlow } from "../../flow/src/flow-server";

const WebSocket = require("reconnecting-websocket");

export default function runMulticoreFlowCombined() {
    const protocol = document.location.protocol === 'https'
        ? 'wss'
        : 'ws';
    const websocket = new WebSocket(protocol + '://' + window.location.host + '/diagram');
    setupFlow(websocket);
    setupMulticore(websocket);
}
