const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      if (req.user && req.user.isAdmin === requiredRole) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    };
  };
  
  module.exports = roleMiddleware;
  