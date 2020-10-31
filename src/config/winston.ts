import { WinstonLogger } from "utils/WinstonLogger";
import winston = require("winston");

const logger = new WinstonLogger({
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

export default logger;