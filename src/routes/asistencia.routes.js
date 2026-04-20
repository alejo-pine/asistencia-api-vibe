const { Router } = require('express');
const { body, param } = require('express-validator');
const AsistenciaController = require('../controllers/asistencia.controller');
const { validarRequest } = require('../middlewares/validators');

const router = Router();

// POST /api/asistencias - Registra una asistencia.
router.post(
    '/',
    [
        body('estudianteId')
            .notEmpty().withMessage('El ID del estudiante es obligatorio')
            .isInt().withMessage('El ID del estudiante debe ser un entero'),
        body('fecha')
            .notEmpty().withMessage('La fecha es obligatoria')
            .isDate({ format: 'YYYY-MM-DD' }).withMessage('La fecha debe tener el formato YYYY-MM-DD'),
        body('estado')
            .notEmpty().withMessage('El estado es obligatorio')
            .isIn(['presente', 'ausente', 'justificada']).withMessage('El estado debe ser: presente, ausente o justificada'),
        validarRequest
    ],
    AsistenciaController.create
);

// GET /api/asistencias/estudiante/:id - Lista el historial completo de asistencias de un estudiante
router.get(
    '/estudiante/:id',
    [
        param('id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
        validarRequest
    ],
    AsistenciaController.getHistorial
);

module.exports = router;