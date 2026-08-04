// simple in-memory blacklist for logged-out tokens. good enough for a
// single-instance app; a real multi-instance production setup would want
// this backed by something shared, like Redis, instead
const blacklist = new Map(); // token -> expiry (unix seconds)

function add(token, exp) {
  blacklist.set(token, exp);
  prune();
}

function isBlacklisted(token) {
  prune();
  return blacklist.has(token);
}

// drops entries that would have expired anyway, so this doesn't grow forever
function prune() {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of blacklist.entries()) {
    if (exp && exp < now) {
      blacklist.delete(token);
    }
  }
}

module.exports = { add, isBlacklisted };
