// middleware/role.js
module.exports = (role) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      next();
    };
  };