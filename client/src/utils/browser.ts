/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Returns whether the mouse or keyboard event includes the CMD key
 * on Mac or CTRL key on Linux / others
 */
export function isCtrlOrCmd(event: KeyboardEvent | MouseEvent) {
    if (isMac())
        return event.metaKey
    else
        return event.ctrlKey
}

export function isMac(): boolean {
    return window.navigator.userAgent.indexOf("Mac") !== -1
}