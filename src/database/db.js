const Database = require('better-sqlite3');
const path = require('path');

// Permite configurar la ruta por variable de entorno para producción (Fly.io) o usar la local.
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'asistencia.db');
const db = new Database(dbPath, { verbose: console.log });

// Inicializar y crear tablas
const initDB = () => {
    try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS estudiantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            email TEXT
          );
        
          CREATE TABLE IF NOT EXISTS asistencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estudianteId INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            estado TEXT NOT NULL CHECK(estado IN ('presente', 'ausente', 'justificada')),
            FOREIGN KEY(estudianteId) REFERENCES estudiantes(id),
            UNIQUE(estudianteId, fecha)
          );
        `);
        console.log("Tablas inicializadas correctamente");
    } catch (error) {
        console.error(`Error inicializando SQLite: ${error.message}`);
    }
};

initDB();

module.exports = db;