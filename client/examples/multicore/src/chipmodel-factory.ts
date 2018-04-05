/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    SGraphFactory, SChildElement, SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement, getBasicType,
    Direction, HtmlRootSchema, PreRenderedElementSchema, PreRenderedElement, HtmlRoot
} from '../../../src';
import {
    Channel, ChannelSchema, Core, CoreSchema, Crossbar, CrossbarSchema, Processor, ProcessorSchema
} from "./chipmodel";
import { CORE_WIDTH, CORE_DISTANCE } from "./views";


export class ChipModelFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        try {
            if (this.isCoreSchema(schema)) {
                this.validate(schema, parent);
                const core = this.initializeChild(new Core(), schema, parent) as Core;
                core.bounds = {
                    x: core.column * (CORE_WIDTH + CORE_DISTANCE),
                    y: core.row * (CORE_WIDTH + CORE_DISTANCE),
                    width: CORE_WIDTH,
                    height: CORE_WIDTH
                };
                return core;
            } else if (this.isChannelSchema(schema)) {
                this.validate(schema, parent);
                return this.initializeChild(new Channel(), schema, parent);
            } else if (this.isCrossbarSchema(schema))
                return this.initializeChild(new Crossbar(), schema, parent);
            else if (this.isPreRenderedSchema(schema))
                return this.initializeChild(new PreRenderedElement(), schema, parent);
        } catch (e) {
            console.error(e.message);
        }
        return super.createElement(schema, parent);
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (this.isProcessorSchema(schema))
            return this.initializeRoot(new Processor(), schema);
        else if (this.isHtmlRootSchema(schema))
            return this.initializeRoot(new HtmlRoot(), schema);
        else
            return super.createRoot(schema);
    }

    private validate(coreOrChannel: CoreSchema | ChannelSchema, processor?: SParentElement) {
        if (processor) {
            if (!(processor instanceof Processor))
                throw new Error('Parent model element must be a Processor');
            let rowDelta = 0;
            let columnDelta = 0;
            if (this.isChannelSchema(coreOrChannel)) {
                switch (coreOrChannel.direction) {
                    case Direction.down:
                    case Direction.up:
                        rowDelta = 1;
                        break;
                    default:
                        columnDelta = 1;
                        break;
                }
            }
            if (coreOrChannel.row < 0 || coreOrChannel.row >= processor.rows + rowDelta
                || coreOrChannel.column < 0 && coreOrChannel.column >= processor.columns + columnDelta)
                throw Error('Element coordinates are out of bounds ' + coreOrChannel);
        }
    }

    isProcessorSchema(schema: SModelElementSchema): schema is ProcessorSchema {
        return getBasicType(schema) === 'processor';
    }

    isCoreSchema(schema: SModelElementSchema): schema is CoreSchema {
        const basicType = getBasicType(schema);
        return basicType === 'core' || basicType === 'simplecore';
    }

    isChannelSchema(schema: SModelElementSchema): schema is ChannelSchema {
        return getBasicType(schema) === 'channel';
    }

    isCrossbarSchema(schema: SModelElementSchema): schema is CrossbarSchema {
        return getBasicType(schema) === 'crossbar';
    }

    isHtmlRootSchema(schema: SModelElementSchema): schema is HtmlRootSchema {
        return getBasicType(schema) === 'html';
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is PreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered';
    }
}
