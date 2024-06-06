const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
require('winston-daily-rotate-file');

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});

// Middleware to log request duration
const logRequestDuration = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    logger.info(`${req.method} ${req.url} - ${durationInMilliseconds.toLocaleString()} ms`);
  });

  next();
};

const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

module.exports = { logger, logRequestDuration };
