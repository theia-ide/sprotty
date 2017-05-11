import { SModelRoot, SModelRootSchema } from "../base/model/smodel"

export interface TextRootSchema extends SModelRootSchema {
    title?: string
    titleClass?: string
    body?: string[]
    bodyClass?: string
}

export class TextRoot extends SModelRoot {
    title: string = ''
    titleClass?: string
    body: string[] = []
    bodyClass?: string
}
