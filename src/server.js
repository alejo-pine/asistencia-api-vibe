require('dotenv').config();
const http = require('http');
const app = require('./app');
const seedDatabase = require('./database/seed');

const PORT = process.env.PORT || 3000;

// Inicializar la BD con datos de prueba
seedDatabase();

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`👉 http://localhost:${PORT}/api`);
});