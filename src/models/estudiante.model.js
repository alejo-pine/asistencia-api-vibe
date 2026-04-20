const db = require('../database/db');

const EstudianteModel = {
    // Modelo para obtener todos los estudiantes
    findAll: () => {
        const stmt = db.prepare('SELECT id, nombre, codigo, email FROM estudiantes');
        return stmt.all();
    },

    // Buscar a uno por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT id, nombre, codigo, email FROM estudiantes WHERE id = ?');
        return stmt.get(id);
    },

    // Buscar a uno por código
    findByCodigo: (codigo) => {
        const stmt = db.prepare('SELECT id FROM estudiantes WHERE codigo = ?');
        return stmt.get(codigo);
    },

    // Crear un registro en la DB
    create: (data) => {
        const result = db.prepare(
            'INSERT INTO estudiantes (nombre, codigo, email) VALUES (@nombre, @codigo, @email)'
        ).run({
            nombre: data.nombre, 
            codigo: data.codigo,
            email: data.email || null
        });
        return result.lastInsertRowid;
    }
};

module.exports = EstudianteModel;