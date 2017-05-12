/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export * from "./model/smodel"
export * from "./model/smodel-factory"
export * from "./model/smodel-storage"
export * from "./model/smodel-utils"
export * from "./types"
export * from "./intent/actions"
export * from "./intent/action-dispatcher"
export * from "./intent/command-stack-options"
export * from "./view/views"
export * from "./view/options"
export * from "./view/key-tool"
export * from "./view/mouse-tool"
export * from "./view/thunk-view"
export * from './view/viewer'
export * from './view/viewer-cache'
export * from './view/vnode-utils'
export * from './view/vnode-decorators'
export * from "./features/model-manipulation"
export * from "./animations/animation-frame-syncer"

import defaultModule from "./di.config"
export { defaultModule }
