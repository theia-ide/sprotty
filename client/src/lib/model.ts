import { SModelRoot, SModelRootSchema } from "../base/model/smodel"

export interface TextRootSchema extends SModelRootSchema {
    title: string
    body: string
}

export class TextRoot extends SModelRoot {
    title: string = ""
    body: string = ""
}