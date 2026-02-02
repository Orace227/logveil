import { Masker } from "../core/masker";
import { CreateMaskedLoggerOptions } from "../core/types";

/**
 * Winston logger type interface (minimal definition to avoid hard dependency)
 */
interface WinstonLogger {
  log(level: string, message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  info(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  verbose(message: string, ...meta: any[]): void;
  silly(message: string, ...meta: any[]): void;
  [key: string]: any;
}

/**
 * Creates a Winston logger wrapper that automatically masks sensitive data
 */
export function createMaskedWinstonLogger(
  options: CreateMaskedLoggerOptions<WinstonLogger>
): WinstonLogger {
  const { logger, ...maskingConfig } = options;
  const masker = new Masker(maskingConfig);

  /**
   * Mask metadata objects
   */
  const maskMetadata = (...meta: any[]): any[] => {
    return meta.map((item) => {
      if (item && typeof item === "object") {
        const result = masker.mask(item);
        return result.masked;
      }
      return item;
    });
  };

  /**
   * Create proxy for the logger
   */
  const maskedLogger: WinstonLogger = {
    log(level: string, message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.log(level, message, ...maskedMeta);
    },

    error(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.error(message, ...maskedMeta);
    },

    warn(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.warn(message, ...maskedMeta);
    },

    info(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.info(message, ...maskedMeta);
    },

    debug(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.debug(message, ...maskedMeta);
    },

    verbose(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.verbose(message, ...maskedMeta);
    },

    silly(message: string, ...meta: any[]): void {
      const maskedMeta = maskMetadata(...meta);
      logger.silly(message, ...maskedMeta);
    }
  };

  // Proxy any other methods or properties
  return new Proxy(maskedLogger, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof WinstonLogger];
      }

      // For any other properties, proxy to the original logger
      const originalValue = logger[prop as string];

      // If it's a logging method, wrap it
      if (typeof originalValue === "function") {
        return (...args: any[]) => {
          const maskedArgs = maskMetadata(...args);
          return originalValue.apply(logger, maskedArgs);
        };
      }

      return originalValue;
    }
  });
}

/**
 * Alternative: Winston Format function for use with winston.format.combine()
 * This can be used directly in Winston's format pipeline
 */
export function createMaskingFormat(maskingConfig: Omit<CreateMaskedLoggerOptions<any>, "logger">) {
  const masker = new Masker(maskingConfig);

  return {
    transform: (info: any) => {
      // Mask the entire info object (except level and message)
      const { level, message, ...rest } = info;

      if (Object.keys(rest).length > 0) {
        const result = masker.mask(rest);
        return {
          level,
          message,
          ...result.masked
        };
      }

      return info;
    }
  };
}
