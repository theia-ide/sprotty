import {Viewer} from "../base/view/Viewer"

export class GGraphViewer extends Viewer {

    constructor() {
        super()
    }

    createDecorators() {
        const decorators = super.createDecorators()
        decorators.push()
        return decorators
    }
}