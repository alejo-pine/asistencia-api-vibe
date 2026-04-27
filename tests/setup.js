// Requiere que DB_PATH=':memory:' y NODE_ENV='test' estén seteados ANTES de importar este módulo.
const db = require('../src/database/db');

const cleanDatabase = () => {
    db.exec('DELETE FROM asistencias');
    db.exec('DELETE FROM estudiantes');
};

module.exports = { cleanDatabase };
