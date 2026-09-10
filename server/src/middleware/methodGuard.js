const ALLOWED_METHODS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
]);

function methodGuard(req, res, next) {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.setHeader('Allow', Array.from(ALLOWED_METHODS).join(', '));

    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `HTTP method ${req.method} is not supported by API Sentinel`
    });
  }

  return next();
}

module.exports = methodGuard;