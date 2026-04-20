const db = require('../database/db');

const seedDatabase = () => {
    try {
        console.log("Generando datos simulados...");

        // Insertar a varios alumnos directamente usando la base de datos
        const insertStudent = db.prepare('INSERT OR IGNORE INTO estudiantes (nombre, codigo, email) VALUES (@nombre, @codigo, @email)');
        
        insertStudent.run({ nombre: 'Juan Pérez', codigo: 'EST00001', email: 'juan@test.com' });
        insertStudent.run({ nombre: 'Maria López', codigo: 'EST00002', email: 'maria@test.com' });
        insertStudent.run({ nombre: 'Carlos Ruiz', codigo: 'EST00003', email: 'carlos@test.com' });
        insertStudent.run({ nombre: 'Ana Gómez', codigo: 'EST00004', email: 'ana@test.com' });
        insertStudent.run({ nombre: 'Luis Martínez', codigo: 'EST00005', email: 'luis@test.com' });

        // Insertar ausencias
        const insertAsistencia = db.prepare('INSERT OR IGNORE INTO asistencias (estudianteId, fecha, estado) VALUES (@estudianteId, @fecha, @estado)');

        // Simulamos asistencias, Juan Pérez tiene 3 ausencias, Maria tiene 2.
        insertAsistencia.run({ estudianteId: 1, fecha: '2024-01-01', estado: 'ausente' });
        insertAsistencia.run({ estudianteId: 1, fecha: '2024-01-02', estado: 'ausente' });
        insertAsistencia.run({ estudianteId: 1, fecha: '2024-01-03', estado: 'ausente' });

        insertAsistencia.run({ estudianteId: 2, fecha: '2024-01-01', estado: 'ausente' });
        insertAsistencia.run({ estudianteId: 2, fecha: '2024-01-02', estado: 'ausente' });

        insertAsistencia.run({ estudianteId: 3, fecha: '2024-01-01', estado: 'presente' });
        insertAsistencia.run({ estudianteId: 3, fecha: '2024-01-02', estado: 'justificada' });

        console.log("Proceso del Seeder completado. 👍");
    } catch(err) {
        console.error("Error el ejecutar seeds:", err.message);
    }
};

seedDatabase();