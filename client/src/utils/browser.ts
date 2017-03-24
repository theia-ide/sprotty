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
    return window.navigator.userAgent.indexOf("Mac") != -1
}