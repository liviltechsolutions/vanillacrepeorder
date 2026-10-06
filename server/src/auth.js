const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const COOKIE_NAME = "beaubook_token";
const JWT_SECRET = process.env.JWT_SECRET;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

function signMerchantToken(merchantId) {
  return jwt.sign({ merchantId }, JWT_SECRET, { expiresIn: "30d" });
}

function verifyMerchantToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return payload.merchantId;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

module.exports = {
  hashPassword,
  verifyPassword,
  signMerchantToken,
  verifyMerchantToken,
  COOKIE_NAME,
  cookieOptions,
};
