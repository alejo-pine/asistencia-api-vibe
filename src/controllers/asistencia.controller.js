const AsistenciaModel = require('../models/asistencia.model');
const EstudianteModel = require('../models/estudiante.model');

// Endpoint para el registro de la asistencia
const create = (req, res, next) => {
    try {
        const { estudianteId, fecha, estado } = req.body;

        // Verificamos que el estudiante realmente se encuentre en db
        const estudiante = EstudianteModel.findById(estudianteId);
        if (!estudiante) {
             return res.status(404).json({ error: 'Proceso inválido: no es posible hallar al estudiante.' });
        }
        
        // Regla: la fecha validada no puede estar en el futuro
        const inputDate = new Date(fecha);
        const hoy = new Date();
        // Restablecemos el tiempo del día actual para hacerlo equitativo
        hoy.setHours(0, 0, 0, 0);
        if (inputDate > hoy || isNaN(inputDate.getTime())) {
            return res.status(400).json({ error: 'No se permiten fechas futuras o con un formato incorrecto.' });
        }

        // Revisar de no insertar duplicados: en la base de datos es clave única pero también acá lo atajamos manual 
        const existe = AsistenciaModel.findByStudentIdAndDate(estudianteId, fecha);
        if (existe) {
            return res.status(409).json({ error: 'La asistencia de este estudiante en dicha fecha ya existe de previo...' });
        }

        const id = AsistenciaModel.create({ estudianteId, fecha, estado });

        res.status(201).json({
            message: 'Ok',
            id
        });
    } catch (error) {
        next(error);
    }
};

// Colección completa de su historial individual (historial por :id)
const getHistorial = (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        const estudiante = EstudianteModel.findById(id);
        if (!estudiante) {
             return res.status(404).json({ error: '404 - no es posible hallar al estudiante.' });
        }

        const historial = AsistenciaModel.getHistorialByEstudianteId(id);
        res.json(historial);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getHistorial
};