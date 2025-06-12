import 'pino-pretty'
import pino, { type LoggerOptions, type Logger as PinoLogger } from 'pino'
import type { LogFields } from './definitions/types'

export class Logger {
  private logger: PinoLogger

  private constructor(pinoLogger: PinoLogger) {
    this.logger = pinoLogger
  }

  static initialize(environment: string, pinoConfig?: LoggerOptions) {
    const isProd = environment === 'production'
    const defaultLevel = isProd ? 'info' : 'debug'
    const baseOptions: LoggerOptions = {
      level: defaultLevel,
      ...(!isProd && !pinoConfig?.transport
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
              },
            },
          }
        : {}),
    }
    const mergedOptions: LoggerOptions = {
      ...baseOptions,
      ...(pinoConfig || {}),
    }
    const pinoLogger = pino(mergedOptions)
    return new Logger(pinoLogger)
  }

  info(msg: string, fields?: LogFields) {
    this.logger.info(fields, msg)
  }
  warn(msg: string, fields?: LogFields) {
    this.logger.warn(fields, msg)
  }
  error(msg: string, fields?: LogFields) {
    this.logger.error(fields, msg)
  }
  debug(msg: string, fields?: LogFields) {
    this.logger.debug(fields, msg)
  }

  get raw() {
    return this.logger
  }
}
