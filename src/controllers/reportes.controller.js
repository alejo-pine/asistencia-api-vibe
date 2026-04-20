const AsistenciaModel = require('../models/asistencia.model');

// Controlador que genera el TOP 5 en base a las mayores inasistencias recopiladas
const getAusentismoTop5 = (req, res, next) => {
    try {
        const reporte = AsistenciaModel.getReporteAusentismo();
        res.json(reporte);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAusentismoTop5
};