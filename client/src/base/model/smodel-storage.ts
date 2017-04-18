import { TYPES } from '../types'
import { SModelRootSchema } from '../model/smodel'
import { SModelFactory, EMPTY_ROOT } from '../model/smodel-factory'
import { inject, injectable } from "inversify"
import { ViewerOptions } from "../view/options"

@injectable()
export class SModelStorage {

    @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions
    
    protected localCache: Map<string, string> = new Map

    store(root: SModelRootSchema) {
        if(this.isLocalStorageAvailable()) 
            localStorage.setItem(this.key, JSON.stringify(root))
        else
            this.localCache.set(this.key, JSON.stringify(root))
    }

    load(): SModelRootSchema  {
        const schema = (this.isLocalStorageAvailable()) 
            ? localStorage.getItem(this.key)
            : this.localCache.get(this.key)
        if(schema)
            return JSON.parse(schema) as SModelRootSchema
        else
            return EMPTY_ROOT
    }

    protected isLocalStorageAvailable(): boolean {
        return typeof localStorage == 'object' && localStorage != null
    }

    protected get key(): string {
        return this.viewerOptions.baseDiv
    }
}