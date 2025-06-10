import path from 'path';
import winston from 'winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

// Define the severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Show different color for different severity levels.
winston.addColors(colors);

const environment = process.env.NODE_ENV?.toLowerCase() || 'development';
const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';

const logFilePath = path.join(__dirname, '../../logs', 'all.log');
const errorLogFilePath = path.join(__dirname, '../../logs', 'error.log');

const format = winston.format.combine(
  // Add the message timestamp
  winston.format.timestamp({ format: new Date().toISOString() }),
  // Colorize the message
  winston.format.colorize({ all: true }),
  // Define the format of the message
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// format to print logs in a file, uncolorize the logs due to lack of color support in files
const formatForFile = winston.format.combine(winston.format.uncolorize(), winston.format.json());

const transports = [
  // Print the messages in console.
  new winston.transports.Console(),
  ...(environment === 'production'
    ? [
        // prints all messages up to specified log level in production
        new winston.transports.File({
          filename: logFilePath,
          level: logLevel,
          format: formatForFile,
        }),
        // prints only error messages in production
        new winston.transports.File({
          filename: errorLogFilePath,
          level: 'error',
          format: formatForFile,
        }),
        new OpenTelemetryTransportV3({}),
      ]
    : []),
];

const Logger = winston.createLogger({
  level: logLevel,
  levels,
  format,
  transports,
});

export default Logger;
