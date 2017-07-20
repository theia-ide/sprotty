/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */


// ------------------ Base ------------------

export * from './base/actions/action'
export * from './base/actions/action-dispatcher'
export * from './base/actions/action-handler'

export * from './base/animations/animation-frame-syncer'
export * from './base/animations/animation'
export * from './base/animations/easing'

export * from './base/commands/command-stack-options'
export * from './base/commands/command-stack'
export * from './base/commands/command'

export * from './base/features/initialize-canvas'
export * from './base/features/set-model'

export * from './base/model/smodel-extension'
export * from './base/model/smodel-factory'
export * from './base/model/smodel-storage'
export * from './base/model/smodel-utils'
export * from './base/model/smodel'

export * from './base/views/key-tool'
export * from './base/views/mouse-tool'
export * from './base/views/thunk-view'
export * from './base/views/view'
export * from './base/views/viewer-cache'
export * from './base/views/viewer-options'
export * from './base/views/viewer'
export * from './base/views/vnode-decorators'
export * from './base/views/vnode-utils'

export * from './base/types'

import defaultModule from './base/di.config'
export { defaultModule }


// ------------------ Features ------------------

export * from "./features/bounds/bounds-manipulation"
export * from "./features/bounds/layout"
export * from "./features/bounds/model"
export * from "./features/bounds/vbox-layout"

export * from "./features/export/export"
export * from "./features/export/model"
export * from "./features/export/svg-exporter"

export * from "./features/fade/fade"
export * from "./features/fade/model"

export * from "./features/hover/hover"
export * from "./features/hover/model"

export * from "./features/move/model"
export * from "./features/move/move"

export * from "./features/select/model"
export * from "./features/select/select"

export * from "./features/undo-redo/undo-redo"

export * from "./features/update/model-matching"
export * from "./features/update/update-model"

export * from "./features/viewport/center-fit"
export * from "./features/viewport/model"
export * from "./features/viewport/scroll"
export * from "./features/viewport/viewport-root"
export * from "./features/viewport/viewport"
export * from "./features/viewport/zoom"

import moveModule from "./features/move/di.config"
import boundsModule from "./features/bounds/di.config"
import fadeModule from "./features/fade/di.config"
import selectModule from "./features/select/di.config"
import undoRedoModule from "./features/undo-redo/di.config"
import viewportModule from "./features/viewport/di.config"
import hoverModule from "./features/hover/di.config"
import exportModule from "./features/export/di.config"
export { moveModule, boundsModule, fadeModule, selectModule, undoRedoModule, viewportModule, hoverModule, exportModule }


// ------------------ Graph ------------------

export * from "./graph/sgraph-factory"
export * from "./graph/sgraph"
export * from "./graph/views"


// ------------------ Library ------------------

export * from "./lib/generic-views"
export * from "./lib/html-views"
export * from "./lib/model"
export * from "./lib/svg-views"


// ------------------ Model Source ------------------

export * from "./model-source/diagram-server"
export * from "./model-source/local-model-source"
export * from "./model-source/websocket"


// ------------------ Utilities ------------------

export * from "./utils/color"
export * from "./utils/css"
export * from "./utils/geometry"
export * from "./utils/logging"
export * from "./utils/registry"
