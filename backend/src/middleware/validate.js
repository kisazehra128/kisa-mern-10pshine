const AppError = require('../utils/AppError');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: true,
      stripUnknown: property === 'body',
    });

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    if (property === 'query') {
      req.validatedQuery = value;
    } else {
      req[property] = value;
    }
    next();
  };
}

module.exports = validate;
