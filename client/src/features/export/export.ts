/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import { VNode } from 'snabbdom/vnode';
import { CommandExecutionContext, HiddenCommand } from '../../base/commands/command';
import { IVNodeDecorator } from '../../base/views/vnode-decorators';
import { isSelectable } from '../select/model';
import { Action } from '../../base/actions/action';
import { SModelElement, SModelRoot } from '../../base/model/smodel';
import { KeyListener } from '../../base/views/key-tool';
import { matchesKeystroke } from '../../utils/keyboard';
import { isExportable } from './model';
import { SvgExporter } from './svg-exporter';
import { EMPTY_ROOT } from '../../base/model/smodel-factory';
import { isViewport } from '../viewport/model';
import { isHoverable } from '../hover/model';
import { TYPES } from '../../base/types';

@injectable()
export class ExportSvgKeyListener extends KeyListener {
    keyDown(element: SModelElement, event: KeyboardEvent): Action[] {
        if (matchesKeystroke(event, 'KeyE', 'ctrlCmd', 'shift'))
            return [ new RequestExportSvgAction() ];
        else
            return [];
    }
}

export class RequestExportSvgAction implements Action {
    kind = ExportSvgCommand.KIND;
}

export class ExportSvgCommand extends HiddenCommand {
    static KIND = 'requestExportSvg';

    execute(context: CommandExecutionContext): SModelRoot {
        if (isExportable(context.root)) {
            const root = context.modelFactory.createRoot(context.modelFactory.createSchema(context.root));
            if (isExportable(root)) {
                root.export = true;
                if (isViewport(root)) {
                    root.zoom = 1;
                    root.scroll = {
                        x: 0,
                        y: 0
                    };
                }
                root.index.all().forEach(element => {
                    if (isSelectable(element) && element.selected)
                        element.selected = false;
                    if (isHoverable(element) && element.hoverFeedback)
                        element.hoverFeedback = false;
                });
                return root;
            }
        }
        return context.modelFactory.createRoot(EMPTY_ROOT);
    }
}

@injectable()
export class ExportSvgDecorator implements IVNodeDecorator {

    root: SModelRoot;

    constructor(@inject(TYPES.SvgExporter) protected svgExporter: SvgExporter) {
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (element instanceof SModelRoot)
            this.root = element;
        return vnode;
    }

    postUpdate(): void {
        if (this.root && isExportable(this.root) && this.root.export)
            this.svgExporter.export(this.root);
    }
}

