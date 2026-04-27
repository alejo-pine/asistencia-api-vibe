// Las dos líneas siguientes DEBEN ir antes de cualquier require para que db.js
// abra una BD en memoria y sin logging durante las pruebas.
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase } = require('./setup');

describe('/api/estudiantes', () => {

    beforeEach(() => {
        cleanDatabase();
    });

    // ──────────────────────────────────────────────────────────
    // Caso 1 — Creación exitosa (caso feliz)
    // ──────────────────────────────────────────────────────────
    test('Caso 1: POST con datos válidos devuelve 201 con id y codigo', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Laura Gómez', codigo: 'EST00001', email: 'laura@uni.edu' });

        expect(res.status).toBe(201);
        expect(res.body.result).toBeDefined();
        expect(res.body.result.id).toBeDefined();
        expect(res.body.result.codigo).toBe('EST00001');
    });

    // ──────────────────────────────────────────────────────────
    // Caso 2 — Código con formato inválido (4 variantes)
    // ──────────────────────────────────────────────────────────
    test('Caso 2a: POST con codigo "abc123" devuelve 400 con campo error', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Pedro', codigo: 'abc123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('Caso 2b: POST con codigo "EST1" (un solo dígito) devuelve 400', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Pedro', codigo: 'EST1' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('Caso 2c: POST con codigo "EST000001" (6 dígitos) devuelve 400', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Pedro', codigo: 'EST000001' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('Caso 2d: POST con codigo "est00001" (minúsculas) devuelve 400', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Pedro', codigo: 'est00001' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    // ──────────────────────────────────────────────────────────
    // Caso 3 — Código duplicado devuelve 409
    // ──────────────────────────────────────────────────────────
    test('Caso 3: POST con codigo duplicado devuelve 409', async () => {
        await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Ana Ruiz', codigo: 'EST00002' });

        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre: 'Carlos López', codigo: 'EST00002' });

        expect(res.status).toBe(409);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 4 — Listado vacío devuelve [] no null ni error
    // ──────────────────────────────────────────────────────────
    test('Caso 4: GET con BD limpia devuelve 200 y array vacío []', async () => {
        const res = await request(app).get('/api/estudiantes');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(0);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 5 — Listado con datos devuelve exactamente N elementos
    // ──────────────────────────────────────────────────────────
    test('Caso 5: GET devuelve exactamente 3 elementos tras crear 3 estudiantes', async () => {
        await request(app).post('/api/estudiantes').send({ nombre: 'Alumno A', codigo: 'EST00001' });
        await request(app).post('/api/estudiantes').send({ nombre: 'Alumno B', codigo: 'EST00002' });
        await request(app).post('/api/estudiantes').send({ nombre: 'Alumno C', codigo: 'EST00003' });

        const res = await request(app).get('/api/estudiantes');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(3);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 6 — Búsqueda de estudiante inexistente devuelve 404
    // ──────────────────────────────────────────────────────────
    test('Caso 6: GET /api/estudiantes/99999 devuelve 404 con campo error', async () => {
        const res = await request(app).get('/api/estudiantes/99999');

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    // ──────────────────────────────────────────────────────────
    // Caso 7 — Payload malformado (campos faltantes) devuelve 400
    // ──────────────────────────────────────────────────────────
    test('Caso 7a: POST con body vacío {} devuelve 400', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({});

        expect(res.status).toBe(400);
    });

    test('Caso 7b: POST con solo codigo (sin nombre) devuelve 400', async () => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ codigo: 'EST00010' });

        expect(res.status).toBe(400);
    });

});
