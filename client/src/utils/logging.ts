import { inject, injectable } from "inversify"
import { TYPES } from "../base/types"
import { IViewerOptions } from "../base/view/options"

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
    logLevel: LogLevel = LogLevel.none

    error(thisArg: any, message: string, ...params: any[]): void {}
    warn(thisArg: any, message: string, ...params: any[]): void {}
    info(thisArg: any, message: string, ...params: any[]): void {}
    log(thisArg: any, message: string, ...params: any[]): void {}
}

@injectable()
export class ConsoleLogger implements ILogger {
    @inject(TYPES.LogLevel) logLevel: LogLevel = LogLevel.log
    @inject(TYPES.IViewerOptions) protected viewOptions: IViewerOptions

    error(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.error)
            console.error.apply(thisArg, this.consoleArguments(thisArg, message, params))
    }

    warn(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.warn)
            console.warn.apply(thisArg, this.consoleArguments(thisArg, message, params))
    }

    info(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.info)
            console.info.apply(thisArg, this.consoleArguments(thisArg, message, params))
    }

    log(thisArg: any, message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.log)
            console.log.apply(thisArg, this.consoleArguments(thisArg, message, params))
    }

    protected consoleArguments(thisArg: any, message: string, params: any[]): any[] {
        let caller: any
        if (typeof thisArg == 'object')
            caller = thisArg.constructor.name
        else
            caller = thisArg
        const date = new Date()
        return [date.toLocaleTimeString() + ' ' + this.viewOptions.baseDiv + ' ' + caller + ': ' + message, ...params]
    }
}
