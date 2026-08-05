// a known, expected error we threw on purpose (bad input, not found, etc) -
// as opposed to an unexpected bug. the error handler treats these differently:
// AppErrors get their real message sent to the client, anything else gets a
// generic "something went wrong" so we don't leak internals
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
