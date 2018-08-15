/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { TYPES } from "../base/types";
import { ViewerOptions } from "../base/views/viewer-options";

export interface ILogger {
    logLevel: LogLevel

    error(thisArg: any, message: string, ...params: any[]): void
    warn(thisArg: any, message: string, ...params: any[]): void
    info(thisArg: any, message: string, ...params: any[]): void
    log(thisArg: any, message: string, ...params: any[]): void
}

export enum LogLevel { none = 0, error = 1, warn = 2, info = 3, log = 4 }

@injectable()
export class NullLogger implements ILogger {
    logLevel: LogLevel = LogLevel.none;

    error(thisArg: any, message: string, ...params: any[]): void {}
    warn(thisArg: any, message: string, ...params: any[]): void {}
    info(thisArg: any, message: string, ...params: any[]): void {}
    log(thisArg: any, message: string, ...params: any[]): void {}
}

@injectable()
export class ConsoleLogger implements ILogger {

    constructor(@inject(TYPES.LogLevel) public logLevel: LogLevel = LogLevel.log,
                @inject(TYPES.ViewerOptions) protected viewOptions: ViewerOptions = { baseDiv: '' } as ViewerOptions) {
    }

    error(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.error)
            try {
                console.error.apply(thisArg, this.consoleArguments(thisArg, message, params));
            } catch (error) {}
    }

    warn(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.warn)
            try {
                console.warn.apply(thisArg, this.consoleArguments(thisArg, message, params));
            } catch (error) {}
    }

    info(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.info)
            try {
                console.info.apply(thisArg, this.consoleArguments(thisArg, message, params));
            } catch (error) {}
    }

    log(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.log)
            try {
                console.log.apply(thisArg, this.consoleArguments(thisArg, message, params));
            } catch (error) {}
    }

    protected consoleArguments(thisArg: any, message: string, params: any[]): any[] {
        let caller: any;
        if (typeof thisArg === 'object')
            caller = thisArg.constructor.name;
        else
            caller = thisArg;
        const date = new Date();
        return [date.toLocaleTimeString() + ' ' + this.viewOptions.baseDiv + ' ' + caller + ': ' + message, ...params];
    }
}
