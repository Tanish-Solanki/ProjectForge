const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with invalid ID: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue || {})[0] || 'field';
    let message = `Duplicate entry for ${field}. Please use another value.`;
    if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else if (err.keyPattern && err.keyPattern.project && err.keyPattern.student) {
      message = 'You have already submitted a join request for this project.';
    }
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
