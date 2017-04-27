import { setupMulticore } from "./multicore-server"
import { setupFlow } from "../../flow/src/flow-server"

const WebSocket = require("reconnecting-websocket")

export default function runMulticoreFlowCombined() {
    const websocket = new WebSocket('ws://' + window.location.host + '/diagram')
    setupFlow(websocket)
    setupMulticore(websocket)
}
