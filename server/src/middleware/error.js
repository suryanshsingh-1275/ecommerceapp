export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, res, next) => {
  const e = new Error(`Not found: ${req.originalUrl}`);
  e.status = 404;
  next(e);
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'CastError') { status = 400; message = 'Invalid id or value'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.code === 11000) { status = 400; message = 'Duplicate value: ' + Object.keys(err.keyValue).join(', '); }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};