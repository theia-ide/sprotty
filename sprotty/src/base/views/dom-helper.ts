/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { ViewerOptions } from "./viewer-options";
import { TYPES } from "../types";
import { SModelElement } from "../model/smodel";

@injectable()
export class DOMHelper {

    constructor(@inject(TYPES.ViewerOptions) private viewerOptions: ViewerOptions) {

    }

    private getPrefix() {
        const prefix = this.viewerOptions !== undefined && this.viewerOptions.baseDiv !== undefined ?
            this.viewerOptions.baseDiv + "_" : "";
        return prefix;
    }

    createUniqueDOMElementId(element: SModelElement): string {
        return this.getPrefix() + element.id;
    }

    findSModelIdByDOMElement(element: Element): string {
        return element.id.replace(this.getPrefix(), '');
    }

}
