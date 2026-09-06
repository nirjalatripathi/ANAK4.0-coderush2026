function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error(err);
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'The requested record id is not valid',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((item) => item.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'That file is too large. Use a photo or PDF under 8 MB.' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Please attach one photo or PDF as proof.' });
  }

  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
}

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { notFound, errorHandler, AppError };
