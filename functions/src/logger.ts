import { logger as firebaseLogger } from "firebase-functions";

/**
 * Write a `DEBUG` severity log.
 */
function debug(message: string) {
  firebaseLogger.debug(message);
}

/**
 * Write an `INFO` severity log.
 */
function info(message: string) {
  firebaseLogger.info(message);
}

/**
 * Write a `WARNING severity log.
 */
function warn(message: string) {
  firebaseLogger.warn(message);
}

/**
 * Write an `ERROR` severity log.
 */
function error(message: string) {
  firebaseLogger.error(message);
}

export const logger = {
  debug,
  info,
  warn,
  error,
};
