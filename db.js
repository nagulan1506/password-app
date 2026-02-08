const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Number, required: true }
});

const resetTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Number, required: true },
  used: { type: Boolean, default: false, required: true }
});

const User = mongoose.model('User', userSchema);
const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

function now() {
  return Math.floor(Date.now() / 1000);
}

function getUserByEmail(email) {
  return User.findOne({ email }).lean();
}

function getUserById(id) {
  return User.findById(id).lean();
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password_hash: passwordHash, created_at: now() });
  return { id: user._id.toString(), email: user.email };
}

async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

function createResetToken(userId, ttlSeconds = 60 * 30) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = now() + ttlSeconds;
  return ResetToken.create({ user_id: userId, token, expires_at: expiresAt }).then(() => ({ token, expiresAt }));
}

function getResetToken(token) {
  return ResetToken.findOne({ token }).lean();
}

function markTokenUsed(token) {
  return ResetToken.updateOne({ token }, { used: true }).then((res) => res.modifiedCount > 0);
}

async function updatePassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return User.updateOne({ _id: userId }, { password_hash: passwordHash }).then((res) => res.modifiedCount > 0);
}

function connectMongo(uri) {
  return mongoose.connect(uri, { autoIndex: true });
}

module.exports = {
  connectMongo,
  createUser,
  verifyUser,
  getUserByEmail,
  getUserById,
  createResetToken,
  getResetToken,
  markTokenUsed,
  updatePassword
};
