process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase } = require('./setup');

describe('/api/reportes', () => {

    beforeEach(() => {
        cleanDatabase();
    });

    // Helper: crea un estudiante y retorna su id.
    const crearEstudiante = async (codigo, nombre) => {
        const res = await request(app)
            .post('/api/estudiantes')
            .send({ nombre, codigo });
        return res.body.result.id;
    };

    // Helper: registra N ausencias para un estudiante usando fechas fijas del año dado.
    // Usa el patrón YYYY-01-DD para evitar cualquier cálculo de zona horaria.
    const registrarAusencias = async (estudianteId, cantidad, año) => {
        for (let i = 0; i < cantidad; i++) {
            const day = String(i + 1).padStart(2, '0');
            const fecha = `${año}-01-${day}`;
            await request(app)
                .post('/api/asistencias')
                .send({ estudianteId, fecha, estado: 'ausente' });
        }
    };

    // ──────────────────────────────────────────────────────────
    // Caso 14 — Reporte de ausentismo con BD vacía devuelve []
    // ──────────────────────────────────────────────────────────
    test('Caso 14: GET /api/reportes/ausentismo con BD vacía devuelve 200 y []', async () => {
        const res = await request(app).get('/api/reportes/ausentismo');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(0);
    });

    // ──────────────────────────────────────────────────────────
    // Caso 15 — Reporte retorna los 5 con más ausencias en orden
    // Distribución: A=10, B=8, C=6, D=4, E=3, F=2, G=1
    // Esperado: top 5 = A, B, C, D, E (en ese orden exacto)
    // ──────────────────────────────────────────────────────────
    test('Caso 15: GET /api/reportes/ausentismo retorna top 5 con más ausencias ordenado DESC', async () => {
        // Cada estudiante usa un año distinto para que sus fechas no colisionen
        const estudA = await crearEstudiante('EST00001', 'Estudiante A');
        const estudB = await crearEstudiante('EST00002', 'Estudiante B');
        const estudC = await crearEstudiante('EST00003', 'Estudiante C');
        const estudD = await crearEstudiante('EST00004', 'Estudiante D');
        const estudE = await crearEstudiante('EST00005', 'Estudiante E');
        const estudF = await crearEstudiante('EST00006', 'Estudiante F');
        const estudG = await crearEstudiante('EST00007', 'Estudiante G');

        await registrarAusencias(estudA, 10, 2020);
        await registrarAusencias(estudB, 8, 2019);
        await registrarAusencias(estudC, 6, 2018);
        await registrarAusencias(estudD, 4, 2017);
        await registrarAusencias(estudE, 3, 2016);
        await registrarAusencias(estudF, 2, 2015);
        await registrarAusencias(estudG, 1, 2014);

        const res = await request(app).get('/api/reportes/ausentismo');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        // Exactamente 5 elementos: F y G deben quedar fuera
        expect(res.body).toHaveLength(5);

        // El primero debe ser Estudiante A con 10 ausencias
        expect(res.body[0].nombre).toBe('Estudiante A');
        expect(res.body[0].cantidad_ausencias).toBe(10);

        // El segundo debe ser Estudiante B con 8
        expect(res.body[1].nombre).toBe('Estudiante B');
        expect(res.body[1].cantidad_ausencias).toBe(8);

        // Todos los elementos deben tener los campos requeridos
        res.body.forEach(item => {
            expect(item.nombre).toBeDefined();
            expect(item.codigo).toBeDefined();
            expect(item.cantidad_ausencias).toBeDefined();
        });
    });

});
