import runStandalone from "./circlegraph/src/standalone"
import runSimpleServer from "./circlegraph/src/simple-server"
import runFlowServer from "./flow/src/flow-server"
import runMulticore from "./multicore/src/multicore"
import runMulticoreServer from "./multicore/src/multicore-server"

let appMode = document.getElementById('sprotty')!.getAttribute('data-app')

if (appMode == 'standalone')
    runStandalone()
else if (appMode == 'simple-server')
    runSimpleServer()
else if (appMode == 'flow-server')
    runFlowServer()
else if (appMode == 'multicore')
    runMulticore()
else if (appMode == 'multicore-server')
    runMulticoreServer()
