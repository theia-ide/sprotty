/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "reflect-metadata";
import "mocha";
import { expect } from "chai";
import { Bounds, EMPTY_BOUNDS } from '../../utils/geometry';
import { SModelRoot } from "../model/smodel";
import { CommandExecutionContext } from '../commands/command';
import { InitializeCanvasBoundsAction, InitializeCanvasBoundsCommand } from './initialize-canvas';

describe('InitializeCanvasBoundsCommand', () => {

    const bounds: Bounds = {
        x: 10,
        y: 20,
        width: 10,
        height: 10
    };

    const root = new SModelRoot();
    const command = new InitializeCanvasBoundsCommand(new InitializeCanvasBoundsAction(bounds));

    const context: CommandExecutionContext = {
        root: root,
        logger: undefined!,
        modelFactory: undefined!,
        modelChanged: undefined!,
        duration: 100,
        syncer: undefined!
    };

    it('execute() works as expected', () => {
        // sanity check for initial bounds values
        expect(EMPTY_BOUNDS).deep.equals(root.canvasBounds);
        command.execute(context);
        expect(bounds).deep.equals(root.canvasBounds);
    });

    it('undo() works as expected', () => {
        command.undo(context);
        expect(bounds).deep.equals(root.canvasBounds);
    });

    it('redo() works as expected', () => {
        command.redo(context);
        expect(bounds).deep.equals(root.canvasBounds);
    });
});
