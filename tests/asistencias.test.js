process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase } = require('./setup');

describe('/api/asistencias', () => {

    beforeEach(() => {
        cleanDatabase();
    });

    // Helper: crea un estudiante y retorna su id capturado de la respuesta.
    const crearEstudiante = async (codigo = 'EST00001', nombre = 'Estudiante Test') => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre, codigo });
        return res.body.result.id;
    };

    // Helper: construye "mañana" usando componentes locales para evitar desplazamiento UTC.
    const fechaMañana = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // ──────────────────────────────────────────────────────────
    // Caso 8 — Registro de asistencia válida devuelve 201
    // ──────────────────────────────────────────────────────────
    test('Caso 8: POST con datos válidos devuelve 201', async () => {
        const estudianteId = await crearEstudiante();

        const res = await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha: '2024-03-15', estado: 'presente' });

        expect(res.status).toBe(201);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 9 — Estado no permitido: enum estricto y case-sensitive
    // ──────────────────────────────────────────────────────────
    test('Caso 9a: POST con estado "tardanza" devuelve 400', async () => {
        const estudianteId = await crearEstudiante();

        const res = await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha: '2024-03-15', estado: 'tardanza' });

        expect(res.status).toBe(400);
    });

    test('Caso 9b: POST con estado "PRESENTE" (mayúsculas) devuelve 400 — enum es case-sensitive', async () => {
        const estudianteId = await crearEstudiante();

        const res = await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha: '2024-03-15', estado: 'PRESENTE' });

        expect(res.status).toBe(400);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 10 — Fecha futura rechazada (calculada dinámicamente)
    // ──────────────────────────────────────────────────────────
    test('Caso 10: POST con fecha de mañana devuelve 400', async () => {
        const estudianteId = await crearEstudiante();
        const fecha = fechaMañana();

        const res = await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha, estado: 'presente' });

        expect(res.status).toBe(400);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 11 — Asistencia duplicada rechazada con 409
    // ──────────────────────────────────────────────────────────
    test('Caso 11: registrar la misma asistencia dos veces devuelve 409 en el segundo intento', async () => {
        const estudianteId = await crearEstudiante();

        await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha: '2024-04-10', estado: 'presente' });

        const res = await request(app)
            .post('/api/asistencias')
            .send({ estudianteId, fecha: '2024-04-10', estado: 'presente' });

        expect(res.status).toBe(409);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 12 — Historial de asistencias: 3 registros, orden DESC
    // ──────────────────────────────────────────────────────────
    test('Caso 12: GET historial devuelve 3 elementos ordenados por fecha DESC', async () => {
        const estudianteId = await crearEstudiante();

        await request(app).post('/api/asistencias').send({ estudianteId, fecha: '2024-01-10', estado: 'presente' });
        await request(app).post('/api/asistencias').send({ estudianteId, fecha: '2024-01-20', estado: 'ausente' });
        await request(app).post('/api/asistencias').send({ estudianteId, fecha: '2024-01-15', estado: 'justificada' });

        const res = await request(app).get(`/api/asistencias/estudiante/${estudianteId}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(3);
        // El más reciente debe estar primero
        expect(res.body[0].fecha).toBe('2024-01-20');
        // El más antiguo debe estar último
        expect(res.body[2].fecha).toBe('2024-01-10');
    });

    // ──────────────────────────────────────────────────────────
    // Caso 13 — Historial de estudiante inexistente devuelve 404
    // ──────────────────────────────────────────────────────────
    test('Caso 13: GET historial de id=99999 devuelve 404, no array vacío', async () => {
        const res = await request(app).get('/api/asistencias/estudiante/99999');

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
        // Asegura que NO devuelve array vacío con status 200
        expect(Array.isArray(res.body)).toBe(false);
    });

});
