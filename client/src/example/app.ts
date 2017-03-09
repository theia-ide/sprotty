import runStandalone from "./standalone"
import runSimpleServer from "./simple-server"

let appMode = document.getElementById('sprotte').getAttribute('data-app')

if (appMode == 'standalone')
    runStandalone()
else if (appMode == 'simple-server')
    runSimpleServer()
