const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-prod';
const JWT_EXPIRY = '24h';

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    subscriptionActive: user.subscriptionActive,
    role: user.role
  }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function jwtMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireSubscription(req, res, next) {
  if (!req.user.subscriptionActive) {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  next();
}

function verifyWebSocketToken(token) {
  if (!token) return false;
  try {
    jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  generateToken,
  verifyPassword,
  jwtMiddleware,
  requireSubscription,
  verifyWebSocketToken
};
