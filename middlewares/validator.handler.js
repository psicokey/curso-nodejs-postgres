const boom = require('@hapi/boom');

function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(boom.badRequest(error));
    } else {
      req[property] = value; // <-- ¡Asegúrate de que esta línea esté!
      next();
    }
  }
}

module.exports = validatorHandler;
