/**
 * An action describes a change to the model declaratively.
 * It is a plain datastructure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export const UndoKind = 'Undo'

export class UndoAction implements Action {
    kind = UndoKind
}

export const RedoKind = 'Redo'

export class RedoAction implements Action {
    kind = RedoKind
}