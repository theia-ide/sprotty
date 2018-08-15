/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../../base/types";
import { SetBoundsCommand, RequestBoundsCommand } from "./bounds-manipulation";
import { HiddenBoundsUpdater } from './hidden-bounds-updater';
import { Layouter, LayoutRegistry } from "./layout";

const boundsModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SetBoundsCommand);
    bind(TYPES.ICommand).toConstructor(RequestBoundsCommand);
    bind(TYPES.HiddenVNodeDecorator).to(HiddenBoundsUpdater).inSingletonScope();
    bind(TYPES.Layouter).to(Layouter).inSingletonScope();
    bind(TYPES.LayoutRegistry).to(LayoutRegistry).inSingletonScope();
});

export default boundsModule;
