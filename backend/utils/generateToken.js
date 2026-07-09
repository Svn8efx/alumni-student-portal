const jwt = require('jsonwebtoken');

/**
 * Signs a JWT embedding the user's id and role.
 * The role is included so the frontend/middleware can make quick
 * authorization decisions without an extra DB lookup on every request.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
