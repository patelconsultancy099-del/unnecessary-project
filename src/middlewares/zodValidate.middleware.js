export function validateWithZod(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      req.body = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
