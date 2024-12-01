const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : {},
    });
  };
  
  module.exports = errorMiddleware;
  