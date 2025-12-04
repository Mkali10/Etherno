const jwt = require('jsonwebtoken');

function jwtMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token');
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // Example subscription check
    if (!user.subscriptionActive) return res.status(403).send('Subscription inactive');
    req.user = user;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

module.exports = { jwtMiddleware };
