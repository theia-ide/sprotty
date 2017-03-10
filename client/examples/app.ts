import runStandalone from "./circlegraph/src/standalone"
import runSimpleServer from "./circlegraph/src/simple-server"
import runMulticore from "./multicore/src/multicore"

let appMode = document.getElementById('sprotte').getAttribute('data-app')

if (appMode == 'standalone')
    runStandalone()
else if (appMode == 'simple-server')
    runSimpleServer()
else if (appMode == 'multicore')
    runMulticore()
