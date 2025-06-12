const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  console
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid Token' });
  }
};

module.exports = auth;
