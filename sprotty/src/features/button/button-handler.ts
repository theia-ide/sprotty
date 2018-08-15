/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { InstanceRegistry } from '../../utils/registry';
import { SButton } from './model';
import { Action } from '../../base/actions/action';
import { injectable, multiInject, optional } from 'inversify';
import { TYPES } from '../../base/types';

export interface IButtonHandler {
    buttonPressed(button: SButton): Action[]
}

export interface IButtonHandlerFactory {
    TYPE: string
    new(): IButtonHandler
}

@injectable()
export class ButtonHandlerRegistry extends InstanceRegistry<IButtonHandler> {

    constructor(@multiInject(TYPES.IButtonHandler)@optional() buttonHandlerFactories: IButtonHandlerFactory[]) {
        super();
        buttonHandlerFactories.forEach(factory => this.register(factory.TYPE, new factory()));
    }
}
