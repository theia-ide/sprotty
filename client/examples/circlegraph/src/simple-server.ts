/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TYPES, RequestModelAction, WebSocketDiagramServer } from "../../../src"
import createContainer from "./di.config"

const WebSocket = require("reconnecting-websocket")

export default function runSimpleServer() {
    const container = createContainer(true)

    // Connect to the diagram server
    const websocket: WebSocket = new WebSocket('ws://localhost:62000')
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.ModelSource)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        diagramServer.handle(new RequestModelAction())
    })

}
