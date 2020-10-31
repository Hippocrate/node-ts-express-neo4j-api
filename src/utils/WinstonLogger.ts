import winston = require("winston");
import { Logger, LogLevel, LogModel } from "./Logger";

export class WinstonLogger extends Logger {
    public logger: winston.Logger;

    public constructor(options?: winston.LoggerOptions) {
        super();
        this.logger = winston.createLogger(options || {
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    level: "debug",
                    handleExceptions: true
                }),
            ],
            exitOnError: false
        });
    }

    public log(log: LogModel) {
        const { level, message, meta } = log;

        if (level === LogLevel.FATAL) {
            this.logger.log({
                level: "fatal",
                message: message,
                meta
            });
        }

        if (level === LogLevel.ERROR) {
            this.logger.log({
                level: "error",
                message: message,
                meta
            });
        }

        if (level === LogLevel.WARN) {
            this.logger.log({
                level: "warn",
                message: message,
                meta
            });
        }

        if (level === LogLevel.INFO) {
            this.logger.log({
                level: "info",
                message: message,
                meta
            });
        }

        if (level === LogLevel.DEBUG) {
            this.logger.log({
                level: "debug",
                message: message,
                meta
            });
        }

        if (level === LogLevel.TRACE) {
            this.logger.log({
                level: "silly",
                message: message,
                meta
            });
        }
    }

    public createChild(meta: any): WinstonLogger {
        const child = new WinstonLogger();
        child.logger = this.logger.child(meta);
        return child;
    }

    public close() {
        this.logger.close();
    }
}
