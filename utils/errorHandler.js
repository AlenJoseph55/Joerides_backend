class AppError extends Error {
    constructor(statusCode, message,isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = isOperational;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }

  const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    // Different response formats based on environment
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } else {
      // Production error response
      res.status(err.statusCode).json({
        status: err.status,
        message: err.isOperational ? err.message : 'Something went wrong!'
      });
      console.log(err)
    }
  };
  
  // Async error handler wrapper
  const catchAsync = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = {
    AppError,
    globalErrorHandler,
    catchAsync
  };
  