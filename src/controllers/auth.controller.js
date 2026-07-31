import crypto from 'crypto';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendMail } from '../utils/email.js';

function serialize(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, emergencyContact: user.emergencyContact };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req, res) {
  const { name, email, password, emergencyContact } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email is already registered' });
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, emergencyContact });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.refreshTokenVersion);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    user: serialize(user),
    accessToken,
    refreshToken
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.refreshTokenVersion);
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user: serialize(user), accessToken, refreshToken });
}

export async function refresh(req, res) {
  const tokenVal = req.cookies?.refreshToken || req.body.refreshToken;
  if (!tokenVal) return res.status(401).json({ message: 'Missing refresh token' });
  const payload = verifyRefreshToken(tokenVal);
  const user = await User.findById(payload.sub);
  if (!user || payload.tokenVersion !== user.refreshTokenVersion) return res.status(401).json({ message: 'Invalid refresh token' });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.refreshTokenVersion);
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ accessToken, refreshToken });
}

export async function logout(req, res) {
  req.user.refreshTokenVersion += 1;
  await req.user.save();
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(204).send();
}

export async function reauth(req, res) {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid password' });
  res.json({ verified: true });
}

export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    await sendMail({ to: user.email, subject: 'SecureGuard password reset', text: `Use this reset token within 30 minutes: ${token}` });
  }
  res.json({ message: 'If that email exists, reset instructions have been sent' });
}

export async function resetPassword(req, res) {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({ resetPasswordHash: tokenHash, resetPasswordExpiresAt: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
  user.passwordHash = await User.hashPassword(req.body.password);
  user.resetPasswordHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  user.refreshTokenVersion += 1;
  await user.save();
  res.json({ message: 'Password updated successfully' });
}

export async function me(req, res) {
  res.json({ user: serialize(req.user) });
}
