const { Router } = require('express');
const { body, param } = require('express-validator');
const EstudianteController = require('../controllers/estudiante.controller');
const { validarRequest } = require('../middlewares/validators');

const router = Router();

// GET /api/estudiantes - Lista todos los estudiantes registrados.
router.get('/', EstudianteController.getAll);

// GET /api/estudiantes/:id - Retorna los datos de un estudiante específico por su ID.
router.get(
    '/:id',
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        validarRequest
    ],
    EstudianteController.getById
);

// POST /api/estudiantes - Crea un nuevo estudiante.
router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('codigo')
            .notEmpty().withMessage('El código es obligatorio')
            .matches(/^EST\d{5}$/).withMessage('El código debe tener el formato EST seguido de 5 dígitos (ej. EST00123)'),
        body('email').optional().isEmail().withMessage('Email inválido'),
        validarRequest
    ],
    EstudianteController.create
);

module.exports = router;