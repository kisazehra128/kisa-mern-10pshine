// wraps an async route handler so a rejected promise (thrown error) gets
// passed to next() automatically, instead of needing a try/catch in every
// single controller function
function asyncHandler(fn) {
  return function (req, res, next) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
