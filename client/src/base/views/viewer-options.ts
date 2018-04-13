/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, interfaces } from "inversify";
import { TYPES } from "../types";

export interface ViewerOptions {
    baseDiv: string
    baseClass: string
    hiddenDiv: string
    hiddenClass: string
    popupDiv: string
    popupClass: string
    popupClosedClass: string
    needsClientLayout: boolean
    needsServerLayout: boolean
    popupOpenDelay: number
    popupCloseDelay: number
}

export const defaultViewerOptions = () => (<ViewerOptions>{
    baseDiv: 'sprotty',
    baseClass: 'sprotty',
    hiddenDiv: 'sprotty-hidden',
    hiddenClass: 'sprotty-hidden',
    popupDiv: 'sprotty-popup',
    popupClass: 'sprotty-popup',
    popupClosedClass: 'sprotty-popup-closed',
    needsClientLayout: true,
    needsServerLayout: false,
    popupOpenDelay: 1000,
    popupCloseDelay: 300
});

/**
 * Utility function to partially set viewer options. Default values (from `defaultViewerOptions`) are used for
 * options that are not specified.
 */
export function configureViewerOptions(context: { bind: interfaces.Bind, isBound: interfaces.IsBound, rebind: interfaces.Rebind },
        options: Partial<ViewerOptions>): void {
    const opt: ViewerOptions = {
        ...defaultViewerOptions(),
        ...options
    };
    if (context.isBound(TYPES.ViewerOptions))
        context.rebind(TYPES.ViewerOptions).toConstantValue(opt);
    else
        context.bind(TYPES.ViewerOptions).toConstantValue(opt);
}

/**
 * Utility function to partially override the currently configured viewer options in a DI container.
 */
export function overrideViewerOptions(container: Container, options: Partial<ViewerOptions>): ViewerOptions {
    const opt = container.get<ViewerOptions>(TYPES.ViewerOptions);
    for (const p in options) {
        if (options.hasOwnProperty(p))
            (opt as any)[p] = (options as any)[p];
    }
    return opt;
}
