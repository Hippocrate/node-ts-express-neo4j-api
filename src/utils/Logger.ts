export enum LogLevel {
    NONE = "NONE",
    FATAL = "FATAL",
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG",
    TRACE = "TRACE",
}


export class LogModel {
    public level: LogLevel;
    public message: string;
    public meta?: any;
}

export abstract class Logger {
    public trace(message: string, meta?: any): void {
        this.innerLog(LogLevel.TRACE, message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.innerLog(LogLevel.DEBUG, message, meta);
    }

    public info(message: string, meta?: any): void {
        this.innerLog(LogLevel.INFO, message, meta);
    }

    public warn(message: string, meta?: any): void {
        this.innerLog(LogLevel.WARN, message, meta);
    }

    public error(message: string, meta?: any): void {
        this.innerLog(LogLevel.ERROR, message, meta);
    }

    public fatal(message: string, meta?: any): void {
        this.innerLog(LogLevel.FATAL, message, meta);
    }

    protected abstract log(log: LogModel);

    private innerLog(level: LogLevel, message: string, meta?: any) {
        const log: LogModel = {
            level: level,
            message: message,
            meta: meta
        };


        log.meta = this.processFromLogMetadata(meta);

        this.log(log);
    }

    public abstract createChild(meta: any): Logger;

    public abstract close(): void;

    protected processFromLogMetadata(model?: any) {
        if (model == null) return model;

        const seenObjects: any[] = [];
        const process = (model) => {
            if (this.IsObject(model)) {
                const clone = this.cloneModel(model);
                return clone;
            }
        };

        return process(model);
    }

    private IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }


    private cloneModel(model) {
        if (model instanceof Error) {
            const clone = {};
            const keys = ["name", "message", "stack", ...Object.keys(model)];
            for (const k of keys) {
                clone[k] = model[k];
            }

            return clone;
        }

        return Object.assign({}, model);
    }
}