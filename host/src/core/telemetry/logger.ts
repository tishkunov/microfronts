/**
 * Logger service для Shell
 * Единая точка для логирования
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[Shell] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    console.info(`[Shell] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[Shell] ${message}`, ...args);
  }

  error(message: string, error?: Error, ...args: any[]) {
    console.error(`[Shell] ${message}`, error, ...args);
    
    // TODO: Отправка в Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error || new Error(message));
    // }
  }
}

export const logger = new Logger();

