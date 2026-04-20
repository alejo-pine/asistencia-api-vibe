const db = require('../database/db');

const AsistenciaModel = {
    findByStudentIdAndDate: (estudianteId, fecha) => {
        const stmt = db.prepare('SELECT id FROM asistencias WHERE estudianteId = ? AND fecha = ?');
        return stmt.get(estudianteId, fecha);
    },

    create: (data) => {
        const result = db.prepare(
            'INSERT INTO asistencias (estudianteId, fecha, estado) VALUES (@estudianteId, @fecha, @estado)'
        ).run({
            estudianteId: data.estudianteId,
            fecha: data.fecha,
            estado: data.estado
        });
        return result.lastInsertRowid;
    },

    getHistorialByEstudianteId: (estudianteId) => {
        const stmt = db.prepare('SELECT id, estudianteId, fecha, estado FROM asistencias WHERE estudianteId = ? ORDER BY fecha DESC');
        return stmt.all(estudianteId);
    },
    
    // Extrae los estudiantes con más ausencias basándose en el estado
    getReporteAusentismo: () => {
        const stmt = db.prepare(`
            SELECT e.nombre, e.codigo, COUNT(a.id) AS cantidad_ausencias
            FROM estudiantes e
            JOIN asistencias a ON e.id = a.estudianteId
            WHERE a.estado = 'ausente'
            GROUP BY e.id
            ORDER BY cantidad_ausencias DESC
            LIMIT 5
        `);
        return stmt.all();
    }
};

module.exports = AsistenciaModel;