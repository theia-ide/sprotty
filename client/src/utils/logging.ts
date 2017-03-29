import "reflect-metadata"
import { injectable, inject } from "inversify"
import { TYPES } from "../base/types"

export interface ILogger {
    error(message: string, ...params: any[]): void
    warn(message: string, ...params: any[]): void
    info(message: string, ...params: any[]): void
    log(message: string, ...params: any[]): void
}

export enum LogLevel { none = 0, error = 1, warn = 2, info = 3, log = 4 }

@injectable()
export class NullLogger implements ILogger {
    error(message: string, ...params: any[]): void {}
    warn(message: string, ...params: any[]): void {}
    info(message: string, ...params: any[]): void {}
    log(message: string, ...params: any[]): void {}
}

@injectable()
export class ConsoleLogger implements ILogger {
    @inject(TYPES.LogLevel) protected logLevel: LogLevel = LogLevel.log

    error(message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.error)
            console.error.apply(this, arguments)
    }

    warn(message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.warn)
            console.warn.apply(this, arguments)
    }

    info(message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.info)
            console.info.apply(this, arguments)
    }

    log(message: string, ...params: any[]): void {
        if (this.logLevel >= LogLevel.log)
            console.log.apply(this, arguments)
    }
}
