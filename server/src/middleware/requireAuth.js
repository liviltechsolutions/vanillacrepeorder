const { COOKIE_NAME, verifyMerchantToken } = require("../auth");

module.exports = function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    req.merchantId = verifyMerchantToken(token);
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
};
