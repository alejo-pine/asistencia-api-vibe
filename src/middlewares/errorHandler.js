// Middleware para capturar y estandarizar la respuesta en caso de errores en Express
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    // Si el error es de base de datos o custom, devolvemos un mensaje controlado
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        error: message
    });
};

module.exports = errorHandler;