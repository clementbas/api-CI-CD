const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
    details: err.details || null
  };

  if (!isProd) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export { notFound, errorHandler };
