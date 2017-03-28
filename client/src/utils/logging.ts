import "reflect-metadata"
import { injectable } from "inversify"

export interface ILogger {
    error(message: string, ...params: any[]): void
    warn(message: string, ...params: any[]): void
    info(message: string, ...params: any[]): void
    log(message: string, ...params: any[]): void
}

@injectable()
export class NullLogger implements ILogger {
    error(message: string, ...params: any[]): void {}
    warn(message: string, ...params: any[]): void {}
    info(message: string, ...params: any[]): void {}
    log(message: string, ...params: any[]): void {}
}

@injectable()
export class ConsoleLogger implements ILogger {
    error(message: string, ...params: any[]): void {
        console.error.apply(this, arguments)
    }

    warn(message: string, ...params: any[]): void {
        console.warn.apply(this, arguments)
    }

    info(message: string, ...params: any[]): void {
        console.info.apply(this, arguments)
    }

    log(message: string, ...params: any[]): void {
        console.log.apply(this, arguments)
    }
}
