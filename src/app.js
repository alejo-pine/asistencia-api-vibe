const express = require('express');
const cors = require('cors');

const estudiantesRoutes = require('./routes/estudiante.routes');
const asistenciasRoutes = require('./routes/asistencia.routes');
const reportesRoutes = require('./routes/reportes.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de rutas desconocidas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware global de manejo de errores
app.use(errorHandler);

module.exports = app;