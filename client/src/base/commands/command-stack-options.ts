/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container } from "inversify";
import { TYPES } from '../types';

/**
 * Options for the command execution
 */
export interface CommandStackOptions {
    /**
     * The default duration of an animated command in milliseconds
     */
    defaultDuration: number

    /**
     * The maximum number of commands that can be undone. Once the undo stack
     * reaches this number, any additional command that is pushed will remove
     * one from the bottom of the stack.
     *
     * If negative, there is no limit, which results in a memory leak.
     */
    undoHistoryLimit: number
}

export function overrideCommandStackOptions(container: Container, options: Partial<CommandStackOptions>): CommandStackOptions {
    const defaultOptions = container.get<CommandStackOptions>(TYPES.CommandStackOptions);
    for (const p in options) {
        if (options.hasOwnProperty(p))
            (defaultOptions as any)[p] = (options as any)[p];
    }
    return defaultOptions;
}
