/**
 * Global Error Handling Middleware
 * Ensures safe, structured JSON error responses without exposing secrets or stack traces.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Sanitize message: never leak API keys
  let message = err.message || 'An unexpected error occurred.';
  if (process.env.BHARATCODE_API_KEY) {
    message = message.replace(new RegExp(process.env.BHARATCODE_API_KEY, 'g'), '[REDACTED]');
  }

  res.status(status).json({
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  });
}

