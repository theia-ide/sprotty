/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export * from "./move/move"
export * from "./move/model"
export * from "./fade/fade"
export * from "./fade/model"
export * from "./update/model-matching"
export * from "./update/update-model"
export * from "./bounds/bounds-manipulation"
export * from "./bounds/model"
export * from "./select/select"
export * from "./select/model"
export * from "./hover/hover"
export * from "./hover/model"
export * from "./undo-redo/undo-redo"
export * from "./viewport/viewport"
export * from "./viewport/viewport-root"
export * from "./viewport/center-fit"
export * from "./viewport/scroll"
export * from "./viewport/zoom"
export * from "./viewport/model"

import moveModule from "./move/di.config"
import boundsModule from "./bounds/di.config"
import fadeModule from "./fade/di.config"
import selectModule from "./select/di.config"
import undoRedoModule from "./undo-redo/di.config"
import viewportModule from "./viewport/di.config"
import hoverModule from "./hover/di.config"

export { moveModule, boundsModule, fadeModule, selectModule, undoRedoModule, viewportModule, hoverModule }
