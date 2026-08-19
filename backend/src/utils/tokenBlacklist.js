const blacklist = new Map(); 
function add(token, exp) {
  blacklist.set(token, exp);
  prune();
}

function isBlacklisted(token) {
  prune();
  return blacklist.has(token);
}

function prune() {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of blacklist.entries()) {
    if (exp && exp < now) {
      blacklist.delete(token);
    }
  }
}

module.exports = { add, isBlacklisted };
