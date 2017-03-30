import { createWebSocket, setupMulticore } from "./multicore-server"
import { setupFlow } from "../../flow/src/flow-server"

export default function runMulticoreFlowCombined() {
    const websocket = createWebSocket('ws://localhost:8080/diagram')
    setupFlow(websocket)
    setupMulticore(websocket)
}
