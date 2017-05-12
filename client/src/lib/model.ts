import { SModelRoot, SModelRootSchema, SChildElement, SModelElementSchema } from "../base/model/smodel"

export interface HtmlRootSchema extends SModelRootSchema {
    classes?: string[]
}

export class HtmlRoot extends SModelRoot {
    classes: string[] = []
}

export interface PreRenderedElementSchema extends SModelElementSchema {
    code: string
}

export class PreRenderedElement extends SChildElement {
    code: string
}
