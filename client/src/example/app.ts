import runStandalone from "./circlegraph/standalone"
import runSimpleServer from "./circlegraph/simple-server"
import runMulticore from "./multicore/multicore"

let appMode = document.getElementById('sprotte').getAttribute('data-app')

if (appMode == 'standalone')
    runStandalone()
else if (appMode == 'simple-server')
    runSimpleServer()
else if (appMode == 'multicore')
    runMulticore()
