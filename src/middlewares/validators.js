const { validationResult } = require('express-validator');

// Retorna el primer error encontrado en forma de JSON, si lo hay.
const validarRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        return res.status(400).json({ error: errorArray[0].msg });
    }
    next();
};

module.exports = {
    validarRequest
};