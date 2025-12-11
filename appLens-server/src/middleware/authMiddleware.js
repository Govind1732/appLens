import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  try {
    // Read Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = { userId: decoded.userId, email: decoded.email };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
