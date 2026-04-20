const { Router } = require('express');
const ReportesController = require('../controllers/reportes.controller');

const router = Router();

// GET /api/reportes/ausentismo - Retorna los 5 estudiantes con más ausencias
router.get('/ausentismo', ReportesController.getAusentismoTop5);

module.exports = router;