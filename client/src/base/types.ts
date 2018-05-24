/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export const TYPES = {
    IActionDispatcher: Symbol('IActionDispatcher'),
    IActionDispatcherProvider: Symbol('IActionDispatcherProvider'),
    IActionHandlerInitializer: Symbol('IActionHandlerInitializer'),
    ActionHandlerRegistry: Symbol('ActionHandlerRegistry'),
    AnimationFrameSyncer: Symbol('AnimationFrameSyncer'),
    CommandStackOptions: Symbol('CommandStackOptions'),
    IButtonHandler: Symbol('IButtonHandler'),
    ICommand: Symbol('ICommand'),
    ICommandStack: Symbol('ICommandStack'),
    ICommandStackProvider: Symbol('ICommandStackProvider'),
    DOMHelper: Symbol('DOMHelper'),
    HiddenVNodeDecorator: Symbol('HiddenVNodeDecorator'),
    HoverState: Symbol('HoverState'),
    KeyListener: Symbol('KeyListener'),
    Layouter: Symbol('Layouter'),
    LayoutRegistry: Symbol('LayoutRegistry'),
    ILogger: Symbol('ILogger'),
    LogLevel: Symbol('LogLevel'),
    IModelFactory: Symbol('IModelFactory'),
    IModelLayoutEngine: Symbol('IModelLayoutEngine'),
    ModelRendererFactory: Symbol('ModelRendererFactory'),
    ModelSource: Symbol('ModelSource'),
    ModelSourceProvider: Symbol('ModelSourceProvider'),
    MouseListener: Symbol('MouseListener'),
    /**
     * @deprecated Use IPopupModelProvider instead.
     */
    PopupModelFactory: Symbol('PopupModelFactory'),
    IPopupModelProvider: Symbol('IPopupModelProvider'),
    PopupMouseListener: Symbol('PopupMouseListener'),
    PopupVNodeDecorator: Symbol('PopupVNodeDecorator'),
    SModelElementRegistration: Symbol('SModelElementRegistration'),
    SModelRegistry: Symbol('SModelRegistry'),
    SModelStorage: Symbol('SModelStorage'),
    StateAwareModelProvider: Symbol('StateAwareModelProvider'),
    SvgExporter: Symbol('SvgExporter'),
    IViewer: Symbol('IViewer'),
    ViewerOptions: Symbol('ViewerOptions'),
    IViewerProvider: Symbol('IViewerProvider'),
    ViewRegistration: Symbol('ViewRegistration'),
    ViewRegistry: Symbol('ViewRegistry'),
    IVNodeDecorator: Symbol('IVNodeDecorator')
};
