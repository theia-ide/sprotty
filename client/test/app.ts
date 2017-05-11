import "reflect-metadata"
import runClassDiagram from "./src/standalone"

let appMode = document.getElementById('sprotty-app')!.getAttribute('data-app')

if (appMode == 'class-diagram')
    runClassDiagram()
