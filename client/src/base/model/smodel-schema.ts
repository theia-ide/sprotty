export interface SModelElementSchema {
    type: string;
    id: string;
    children?: SModelElementSchema[];
}

export interface SModelRootSchema extends SModelElementSchema {
}

export namespace SModelSchema {

    export function getBasicType(schema: SModelElementSchema): string {
        let colonIndex = schema.type.indexOf(':')
        if (colonIndex >= 0)
            return schema.type.substring(0, colonIndex)
        else
            return schema.type
    }

}
