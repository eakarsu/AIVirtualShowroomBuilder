import jwt from 'jsonwebtoken';

function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return process.env.JWT_SECRET;
}

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'bearer token required' });
  try {
    const verified = jwt.verify(token, secret(), { algorithms: ['HS256'] });
    if (!verified.id || !verified.tenantId || !verified.role || !Array.isArray(verified.subjectIds)) {
      return res.status(403).json({ error: 'signed actor, tenant, role, and subject claims required' });
    }
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function generateToken(user) {
  return jwt.sign({
    id: String(user.id),
    email: user.email,
    role: user.role || 'showroom_operator',
    tenantId: process.env.GOVERNANCE_TENANT_ID,
    subjectIds: [`account:${user.id}`]
  }, secret(), { algorithm: 'HS256', expiresIn: '8h' });
}
