/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from '../../base/types';
import { ExportSvgDecorator, ExportSvgKeyListener, ExportSvgCommand } from './export';
import { SvgExporter } from './svg-exporter';

const exportSvgModule = new ContainerModule(bind => {
    bind(TYPES.KeyListener).to(ExportSvgKeyListener).inSingletonScope();
    bind(TYPES.HiddenVNodeDecorator).to(ExportSvgDecorator).inSingletonScope();
    bind(TYPES.ICommand).toConstructor(ExportSvgCommand);
    bind(TYPES.SvgExporter).to(SvgExporter).inSingletonScope();
});

export default exportSvgModule;
