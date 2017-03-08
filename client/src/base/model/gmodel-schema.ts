export interface GModelElementSchema {
    type: string;
    id: string;
    children?: GModelElementSchema[];
    parent?: GModelElementSchema;
}

export interface GModelRootSchema extends GModelElementSchema {
}

export namespace GModelSchema {

    export function getBasicType(schema: GModelElementSchema): string {
        let colonIndex = schema.type.indexOf(':')
        if (colonIndex >= 0)
            return schema.type.substring(0, colonIndex)
        else
            return schema.type
    }

}
