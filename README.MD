# Taller práctico — Del vibe coding a la ingeniería agéntica

---

## 1. Presentación

Este taller confronta dos formas de construir software con apoyo de IA que hoy conviven en la industria: el **vibe coding** (aceptar todo lo que genera la IA sin leerlo, acuñado por Andrej Karpathy en febrero de 2025) y la **ingeniería agéntica** (orquestar agentes de IA bajo supervisión profesional, concepto que el mismo Karpathy propuso en 2026 al reconocer los límites del término original).

De forma simple: **vas a vibe-codear una API en Node.js, y después vas a demostrar en tu propio código por qué esa práctica, sin disciplina de ingeniería, no es suficiente para producción.**

---

## 2. Objetivos de aprendizaje

Al finalizar el taller, el estudiante será capaz de:

1. Usar una herramienta de IA asistida (Cursor, GitHub Copilot, Claude, ChatGPT) para generar código funcional a partir de prompts en lenguaje natural.
2. Auditar código generado por IA identificando problemas de seguridad, validación, manejo de errores y mantenibilidad.
3. Escribir pruebas automatizadas sobre una API existente con Jest y Supertest.
4. Justificar, con evidencia del propio trabajo, cuándo el vibe coding es aceptable y cuándo es profesionalmente irresponsable.
5. Aplicar principios de ingeniería agéntica en el uso cotidiano de herramientas de IA.

---

## 3. Prerrequisitos

- Acceso a una herramienta de IA asistida: Cursor, GitHub Copilot, Claude Code, Claude.ai o ChatGPT.
- Git configurado para versionar el progreso.

---

## 4. Contexto del problema

Construirás una **API REST de gestión de asistencia estudiantil** para un programa académico ficticio. La API debe permitir registrar estudiantes, registrar asistencias por fecha y generar un reporte de ausentismo.

### Endpoints requeridos

| Método | Ruta                                  | Descripción                                                 |
| ------ | ------------------------------------- | ----------------------------------------------------------- |
| POST   | `/api/estudiantes`                    | Crear un estudiante                                         |
| GET    | `/api/estudiantes`                    | Listar todos los estudiantes                                |
| GET    | `/api/estudiantes/:id`                | Obtener un estudiante por ID                                |
| POST   | `/api/asistencias`                    | Registrar una asistencia (estudiante, fecha, estado)        |
| GET    | `/api/asistencias/estudiante/:id`     | Listar asistencias de un estudiante                         |
| GET    | `/api/reportes/ausentismo`            | Top 5 estudiantes con más ausencias                         |

### Reglas de negocio mínimas

- El código del estudiante debe ser único, con formato `EST` seguido de 5 dígitos (por ejemplo, `EST00123`).
- El estado de asistencia solo puede ser `presente`, `ausente` o `justificada`.
- Una asistencia no puede duplicarse para el mismo estudiante y la misma fecha.
- La fecha debe ser válida y no futura.

---

## 5. Flujo del taller

El taller se divide en cuatro fases. Cada fase tiene un tiempo sugerido y un punto de control.

### Fase 1 — Vibe coding puro (20 minutos)

**Regla de oro de esta fase:** te entregas a las vibras. No escribes código manualmente, no revisas los diffs línea por línea, no investigas si lo que te genera la IA tiene buenas prácticas. Tu rol es el que describió Karpathy: **ver cosas, decir cosas, ejecutar cosas, copiar y pegar cosas**.

**Pasos:**

1. Crea un repositorio nuevo en tu GitHub llamado `asistencia-api-vibe`.
2. Haz el primer commit con un `README.md` vacío.
3. Abre tu herramienta de IA preferida y, con un prompt inicial en lenguaje natural, pide la API completa. Ejemplo de prompt aceptable:

   > "Necesito una API en Node.js con Express para gestionar asistencia estudiantil. Debe tener endpoints para crear y listar estudiantes, registrar asistencias y generar un reporte de ausentismo. Los estudiantes tienen un código con formato EST seguido de 5 dígitos. El estado de asistencia es presente, ausente o justificada. Hazlo funcional, me corre en local."

4. Copia y pega el código que te genere. Si te pide ejecutar `npm install`, hazlo sin leer qué dependencias agrega. Si aparecen errores, cópialos y pégalos en el chat de la IA hasta que se resuelvan.
5. Cuando logres que los seis endpoints respondan, haz commit con el mensaje `vibe: API funcional segun la IA`.

**Punto de control:** debes poder hacer `POST /api/estudiantes` y `GET /api/estudiantes` desde Postman o `curl` y obtener respuesta `200`.

**Entregable parcial:** captura de pantalla de los seis endpoints respondiendo + commit en GitHub.

---

### Fase 2 — Auditoría crítica del código generado (20 minutos)

Se tiene la siguiente lista de verificación, para cada ítem, guarda en un archivo `AUDITORIA.md` qué encontraste, con la referencia al archivo y la línea específica.

**Checklist de auditoría:**

| # | Aspecto | Pregunta |
|---|---------|----------|
| 1 | Validación de entrada | ¿Valida el formato del código del estudiante? ¿Rechaza fechas futuras? ¿Valida el enum del estado? |
| 2 | Manejo de errores | ¿Hay try/catch en las rutas? ¿Devuelve códigos HTTP correctos (400, 404, 409, 500)? |
| 3 | Inyección y seguridad | Si usa base de datos, ¿parametriza consultas? ¿Escapa entradas? ¿Tiene rate limiting? ¿CORS configurado? |
| 4 | Datos sensibles | ¿Expone información de estudiantes sin autenticación? ¿Hay manejo de datos personales según habeas data? |
| 5 | Estructura y mantenibilidad | ¿Separa rutas, controladores y lógica? ¿O todo está en `index.js`? ¿Los nombres son descriptivos? |
| 6 | Dependencias | ¿Qué paquetes agregó? ¿Los necesita? ¿Tienen vulnerabilidades? Ejecuta `npm audit`. |
| 7 | Configuración | ¿Hardcodea puertos o credenciales? ¿Usa variables de entorno? ¿Hay `.env.example`? |
| 8 | Idempotencia y duplicados | ¿Permite registrar dos asistencias iguales para el mismo estudiante y fecha? |
| 9 | Pruebas | ¿Generó alguna prueba automatizada? ¿O cero? |
| 10 | Documentación | ¿El README explica cómo correrlo? ¿Hay comentarios útiles o vacíos? |

**Formato del archivo `AUDITORIA.md`:**

```markdown
## Hallazgo 1 — Validación de código del estudiante
- **Severidad:** media
- **Archivo/línea:** src/routes/estudiantes.js, línea 23
- **Descripción:** El endpoint POST /api/estudiantes no valida el patrón EST\d{5}.
- **Evidencia:** envié POST con codigo "abc" y respondió 201.
- **Impacto:** datos inconsistentes en el sistema real.
```

**Punto de control:** mínimo 8 hallazgos documentados.

**Entregable parcial:** `AUDITORIA.md` en el repositorio + commit `docs: auditoria del codigo generado`.

---

### Fase 3 — Pruebas retroactivas para revelar los bugs (30 minutos)

Ahora vas a escribir las pruebas que **deberían haber existido antes**.

**Instrucciones:**

1. Instala Jest y Supertest:
   ```bash
   npm install --save-dev jest supertest
   ```
2. Configura el script de pruebas en `package.json`:
   ```json
   "scripts": { "test": "jest --verbose" }
   ```
3. Crea una carpeta `tests/` y escribe al menos **15 casos de prueba** que cubran:
   - Creación exitosa de estudiante (caso feliz).
   - Rechazo de estudiante con código inválido.
   - Rechazo de estudiante duplicado.
   - Listado vacío y con datos.
   - Registro de asistencia válida.
   - Rechazo de asistencia con estado no permitido.
   - Rechazo de asistencia con fecha futura.
   - Rechazo de asistencia duplicada (mismo estudiante, misma fecha).
   - Consulta de estudiante inexistente (404).
   - Reporte de ausentismo con 0, 1 y varios estudiantes.
   - Manejo de payload malformado (JSON inválido).
   - Manejo de campos faltantes.

4. Ejecuta las pruebas y observa cuáles fallan. **Cada prueba roja es un bug que el vibe coding dejó pasar.**

5. Consigna en `AUDITORIA.md` una nueva sección titulada "Bugs confirmados por pruebas" con la lista de pruebas que fallaron y qué revelan.

**Ejemplo mínimo de prueba con Supertest:**

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('POST /api/estudiantes', () => {
  test('rechaza codigo con formato invalido', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .send({ codigo: 'abc', nombre: 'Juan' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
```

**Entregable parcial:** carpeta `tests/` con los 15 casos + reporte de resultados + commit `test: pruebas retroactivas reveladoras`.

---

### Fase 4 — Refactorización como ingeniería agéntica (45 minutos)

Ahora vuelves a usar la IA, pero esta vez **tú eres el supervisor**. El cambio es fundamental: en lugar de pedir "arréglame esto", das instrucciones precisas basadas en los hallazgos y revisas cada cambio antes de aceptarlo.

**Reglas de esta fase:**

- Cada prompt debe referenciar un hallazgo específico de `AUDITORIA.md`.
- Después de cada respuesta de la IA, **lees el diff** y decides si lo aceptas, lo rechazas o lo ajustas.
- Si algo no te queda claro, preguntas hasta entenderlo, o lo investigas en la documentación oficial.
- Cada corrección debe quedar cubierta por una prueba que antes fallaba y ahora pasa.

**Ejemplo de prompt bien dirigido:**

> "En `src/routes/estudiantes.js`, el POST no valida el formato del código (hallazgo 1 de AUDITORIA.md). Agrega una validación con una expresión regular `^EST\\d{5}$` usando express-validator. No toques otros archivos. Muéstrame solo el diff del archivo afectado."

**Al terminar:**

1. Ejecuta `npm test`: todas las pruebas deben pasar.
2. Ejecuta `npm audit`: documenta qué vulnerabilidades quedaron.
3. Actualiza el `README.md` con instrucciones reales de instalación, variables de entorno necesarias y cómo ejecutar las pruebas.
4. Haz commit final: `refactor: ingenieria agentica aplicada sobre base vibe`.

**Entregable parcial:** repositorio con pruebas en verde + `README.md` profesional + commit final.

---

## 6. Principios que se consolidan con este taller

1. **La IA no reemplaza la comprensión.** Produce código; tú respondes por él.
2. **Las pruebas son la herramienta de verificación más honesta** cuando el autor del código no eres tú.
3. **Los prompts pobres generan código pobre**; la ingeniería agéntica empieza por saber pedir con precisión.
4. **Vibe coding tiene lugar**: prototipos personales, pruebas de concepto, proyectos desechables de fin de semana. No en sistemas con datos de usuarios, ni en entornos regulados, ni en infraestructura crítica.
5. **Tu valor profesional no está en teclear más rápido**, sino en saber qué pedir, qué aceptar, qué rechazar y qué probar.

---

## 7. Lecturas y recursos complementarios

- Karpathy, A. (2 de febrero de 2025). *"There's a new kind of coding I call vibe coding..."*. X (Twitter).
- Karpathy, A. (febrero de 2026). Publicación sobre *agentic engineering* como evolución del término vibe coding.
- MIT Technology Review. (abril de 2025). *What is vibe coding, exactly?*
- IBM Think. (2025). *What is Vibe Coding?*
- Google Cloud. (2025). *Vibe Coding Explained: Tools and Guides*.
- Documentación oficial de Jest: https://jestjs.io
- Documentación oficial de Supertest: https://github.com/ladjs/supertest