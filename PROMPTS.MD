### PROMPT FASE 1:

Incluye un archivo `.env.example` y un `README.md` con instrucciones
claras para levantar el proyecto.

---

## 📋 Endpoints requeridos

Implementa los siguientes seis endpoints:

| Método | Ruta                              | Descripción                                                      |
|--------|-----------------------------------|------------------------------------------------------------------|
| POST   | `/api/estudiantes`                | Crea un estudiante. Acepta `nombre`, `codigo` y `email` (opcional) |
| GET    | `/api/estudiantes`                | Lista todos los estudiantes registrados                          |
| GET    | `/api/estudiantes/:id`            | Retorna un estudiante por ID. Si no existe, responde `404`       |
| POST   | `/api/asistencias`                | Registra una asistencia con `estudianteId`, `fecha` y `estado`   |
| GET    | `/api/asistencias/estudiante/:id` | Lista el historial de asistencias ordenado por fecha descendente |
| GET    | `/api/reportes/ausentismo`        | Top 5 estudiantes con más ausencias, de mayor a menor           |

---

## ⚙️ Reglas de negocio (obligatorias)

Valida y rechaza las peticiones que no cumplan estas reglas.
Devuelve siempre un mensaje de error claro en el body:

- **Formato de código:** debe ser único y coincidir con el patrón
  `EST\d{5}` (por ejemplo, `EST00123`). Valida con expresión regular.
  → Código inválido: `400 Bad Request`
  → Código duplicado: `409 Conflict`

- **Estado de asistencia:** solo acepta los valores `presente`,
  `ausente` o `justificada` (case-sensitive).
  → Cualquier otro valor: `400 Bad Request`

- **Asistencia duplicada:** no se puede registrar más de una asistencia
  para el mismo estudiante en la misma fecha.
  → Si ya existe: `409 Conflict`

- **Fecha válida:** debe tener formato `YYYY-MM-DD`, ser una fecha real
  del calendario y **no puede ser futura**.
  → Fecha inválida o futura: `400 Bad Request`

---

## ✅ Calidad del código

- Usa middleware de validación centralizado (`express-validator`
  o validación manual propia).
- Implementa un middleware global de manejo de errores al final de
  `app.js` que capture cualquier excepción no controlada.
- Incluye un archivo de **seeds** o script de población con al menos
  5 estudiantes y varias asistencias de prueba.
- Agrega comentarios breves únicamente en las partes no obvias del
  código; evita comentarios que solo repiten lo que ya dice el código.

---

## 🚀 Entregable

Genera todos los archivos necesarios para que el proyecto funcione con:

```bash
npm install && npm start
```

**Orden de implementación sugerido:**
1. Estructura de carpetas y configuración inicial
2. Modelo de datos y conexión a la base de datos
3. Endpoints en el orden listado arriba
4. Middleware de validación y manejo de errores
5. Seeds y README


### PROMPT FASE 2:

# Prompt — Auditoría Crítica de la API de Asistencia Estudiantil

Actúa como un **Senior Backend Auditor**. Tu tarea es realizar una revisión
crítica del código de la API de asistencia estudiantil que acabamos de generar.
Debes evaluar el proyecto basándote estrictamente en la siguiente lista de
verificación y generar un archivo llamado `AUDITORIA.md`.

---

## 📋 Lista de verificación de auditoría

| # | Aspecto                       | Pregunta                                                                                                      |
|---|-------------------------------|---------------------------------------------------------------------------------------------------------------|
| 1 | Validación de entrada         | ¿Valida el formato del código del estudiante? ¿Rechaza fechas futuras? ¿Valida el enum del estado?            |
| 2 | Manejo de errores             | ¿Hay `try/catch` en las rutas? ¿Devuelve códigos HTTP correctos (400, 404, 409, 500)?                         |
| 3 | Inyección y seguridad         | ¿Parametriza consultas? ¿Escapa entradas? ¿Tiene rate limiting? ¿CORS configurado?                            |
| 4 | Datos sensibles               | ¿Expone información de estudiantes sin autenticación? ¿Hay manejo de datos personales según habeas data?      |
| 5 | Estructura y mantenibilidad   | ¿Separa rutas, controladores y lógica? ¿O todo está en `index.js`? ¿Los nombres son descriptivos?             |
| 6 | Dependencias                  | ¿Qué paquetes se agregaron? ¿Son necesarios? ¿Tienen vulnerabilidades conocidas? Ejecuta `npm audit`.         |
| 7 | Configuración                 | ¿Hardcodea puertos o credenciales? ¿Usa variables de entorno? ¿Existe `.env.example`?                         |
| 8 | Idempotencia y duplicados     | ¿Permite registrar dos asistencias iguales para el mismo estudiante y fecha?                                  |
| 9 | Pruebas                       | ¿Generó alguna prueba automatizada? ¿O ninguna?                                                               |
| 10 | Documentación                | ¿El README explica cómo correrlo? ¿Los comentarios son útiles o están vacíos?                                 |

---

## 🔍 Instrucciones de ejecución

1. Analiza el código comparándolo con **cada uno de los 10 puntos** de la tabla
   anterior, revisando los archivos línea por línea.
2. Identifica fallos u omisiones técnicas.
   **Debes documentar un mínimo de 8 hallazgos.**
3. Para cada problema encontrado, redacta una entrada en `AUDITORIA.md`
   siguiendo estrictamente el formato definido a continuación.

---

## 📄 Formato obligatorio para cada hallazgo en `AUDITORIA.md`

```markdown
## Hallazgo [N] — [Nombre del aspecto auditado]
- **Severidad:** alta | media | baja
- **Archivo/línea:** [ruta relativa del archivo], línea [número]
- **Descripción:** [Explicación técnica clara del error u omisión encontrada]
- **Evidencia:** [Qué ocurre al ejecutar esa acción o qué fragmento de
  código lo demuestra]
- **Impacto:** [Consecuencia directa en un entorno real o académico]
```

---

## ✅ Criterios de severidad

| Severidad | Cuándo aplicarla                                                             |
|-----------|------------------------------------------------------------------------------|
| **Alta**  | Permite inyección, expone datos sin autenticación o rompe el sistema         |
| **Media** | Validaciones incompletas, CORS abierto, credenciales hardcodeadas            |
| **Baja**  | Comentarios vacíos, nombres poco descriptivos, dependencias no utilizadas    |

---

## 🔖 Entregable

Una vez completado el análisis:

1. Guarda el archivo `AUDITORIA.md` en la raíz del repositorio.
2. Realiza el commit con el mensaje:

```bash
git add AUDITORIA.md
git commit -m "docs: auditoria del codigo generado"
```

Comienza ahora el análisis detallado y genera el archivo solicitado.


### PROMPT FASE 3:
# 🧪 Prompt: Escritura de Pruebas para API REST de Asistencia Estudiantil

Eres el mismo desarrollador que construyó la API REST de gestión de asistencia estudiantil
y que luego auditó su propio código. Ahora tienes una tercera misión: escribir las pruebas
que deberían haber existido desde el principio, con el objetivo explícito de revelar bugs
que el desarrollo rápido dejó pasar.

> No escribas pruebas para que pasen. Escríbelas para que sean honestas.
> Si el sistema tiene un bug, la prueba debe ponerse en rojo y dejarlo en evidencia.

---

## ⚙️ Paso 1 — Preparación del entorno de pruebas

Asegúrate de que `src/app.js` (o el archivo principal de Express) exporte la instancia de
`app` **sin llamar a `app.listen()`**. El servidor debe levantarse solo en un archivo separado
(por ejemplo, `src/server.js`). Esto es un requisito para que Supertest funcione correctamente.

Si el código actual no tiene esta separación, refactorízalo antes de continuar y documenta el cambio.

---

## 📁 Paso 2 — Estructura de la carpeta `tests/`

Crea la siguiente estructura:

```text
tests/
├── setup.js              ← limpieza de base de datos entre tests
├── estudiantes.test.js   ← pruebas del recurso /api/estudiantes
├── asistencias.test.js   ← pruebas del recurso /api/asistencias
└── reportes.test.js      ← pruebas del recurso /api/reportes
```

En `setup.js`, implementa una función que **limpie completamente** las tablas de la base de
datos antes de cada suite de pruebas, para que los tests sean independientes entre sí y no
dependan del orden de ejecución. Usa `beforeEach` o `beforeAll` según corresponda.

---

## 🧪 Paso 3 — Los 15 casos de prueba obligatorios

Implementa **exactamente** los siguientes casos. No los omitas ni los simplifiques. Cada uno
tiene un propósito específico para detectar un tipo de bug diferente.

### Archivo: `tests/estudiantes.test.js`

**Caso 1 — Creación exitosa (caso feliz)**
Envía un `POST /api/estudiantes` con `{ nombre: "Laura Gómez", codigo: "EST00001", email: "laura@uni.edu" }`.
Espera `201 Created` y que el body contenga el campo `id` y el `codigo` enviado.

**Caso 2 — Código con formato inválido**
Envía `POST /api/estudiantes` con `{ codigo: "abc123", nombre: "Pedro" }`.
Espera `400 Bad Request` y que el body tenga la propiedad `error`.
Repite con `"EST1"`, `"EST000001"` (6 dígitos) y `"est00001"` (minúsculas).
Cada variante debe devolver `400`.

**Caso 3 — Código duplicado**
Crea un estudiante con `EST00002`. Intenta crear otro con el mismo código.
Espera `409 Conflict` en el segundo intento.

**Caso 4 — Listado vacío**
Consulta `GET /api/estudiantes` con la base de datos limpia.
Espera `200 OK` y que el body sea un array vacío `[]`, no `null` ni un error.

**Caso 5 — Listado con datos**
Crea 3 estudiantes y luego consulta `GET /api/estudiantes`.
Espera `200 OK` y que el array tenga exactamente 3 elementos.

**Caso 6 — Búsqueda de estudiante inexistente**
Consulta `GET /api/estudiantes/99999`.
Espera `404 Not Found` y que el body tenga la propiedad `error`.

**Caso 7 — Payload malformado (campos faltantes)**
Envía `POST /api/estudiantes` con `{}` (body vacío) y luego con `{ codigo: "EST00010" }` (sin nombre).
Espera `400` en ambos casos.

---

### Archivo: `tests/asistencias.test.js`

**Caso 8 — Registro de asistencia válida**
Crea un estudiante primero. Luego envía `POST /api/asistencias` con
`{ estudianteId: [id], fecha: "2025-03-15", estado: "presente" }`.
Espera `201 Created`.

**Caso 9 — Estado de asistencia no permitido**
Envía `POST /api/asistencias` con `estado: "tardanza"` y luego con `estado: "PRESENTE"` (mayúsculas).
Espera `400` en ambos casos. Esto verifica que el enum sea estricto y case-sensitive.

**Caso 10 — Fecha futura rechazada**
Construye **dinámicamente** en el código de la prueba una fecha que sea siempre mañana
(`new Date()` + 1 día en formato `YYYY-MM-DD`). Envía `POST /api/asistencias` con esa fecha.
Espera `400 Bad Request`.
> ⚠️ Nunca uses una fecha futura hardcodeada en el código de la prueba.

**Caso 11 — Asistencia duplicada rechazada**
Registra una asistencia para el estudiante X en la fecha `2025-04-10`.
Intenta registrar exactamente la misma asistencia nuevamente.
Espera `409 Conflict` en el segundo intento.

**Caso 12 — Historial de asistencias de un estudiante**
Crea un estudiante y registra 3 asistencias en fechas distintas.
Consulta `GET /api/asistencias/estudiante/:id`.
Espera `200 OK` y que el array tenga 3 elementos **ordenados por fecha descendente**.

**Caso 13 — Historial de estudiante inexistente**
Consulta `GET /api/asistencias/estudiante/99999`.
Espera `404 Not Found`, no un array vacío.

---

### Archivo: `tests/reportes.test.js`

**Caso 14 — Reporte de ausentismo sin datos**
Consulta `GET /api/reportes/ausentismo` con la base de datos limpia.
Espera `200 OK` y un array vacío `[]`. No debe lanzar un error `500`.

**Caso 15 — Reporte retorna los 5 con más ausencias en orden correcto**
Crea 7 estudiantes. Registra ausencias así:

| Estudiante | Ausencias |
|---|---|
| A | 10 |
| B | 8 |
| C | 6 |
| D | 4 |
| E | 3 |
| F | 2 |
| G | 1 |

Consulta el reporte. Espera que el array tenga **exactamente 5 elementos**, que el primero
sea el estudiante A y que cada elemento tenga los campos `nombre`, `codigo` y `totalAusencias`
(o el nombre equivalente que use tu implementación).

---

## ▶️ Paso 4 — Ejecutar y observar con honestidad

```bash
npm test
```

**No corrijas los bugs todavía.** El objetivo en esta fase es revelarlos, no resolverlos.
Deja que las pruebas fallen si deben fallar. Luego ejecuta también:

```bash
npm run test:coverage
```

Captura la salida completa de ambos comandos.

---

## 📝 Paso 5 — Documentar en `AUDITORIA.md`

Abre el archivo `AUDITORIA.md` que creaste en la fase anterior y agrega al final una nueva
sección con exactamente este formato:

```text
***
## Bugs confirmados por pruebas

**Fecha de ejecución:** YYYY-MM-DD
**Total de pruebas escritas:** 15
**Pruebas que pasaron (verde):** X
**Pruebas que fallaron (rojo):** Y

### Bug confirmado 1 — [Nombre del test que falló]
- **Archivo de prueba/línea:** tests/estudiantes.test.js, línea 42
- **Endpoint afectado:** POST /api/estudiantes
- **Comportamiento esperado:** HTTP 400 al enviar codigo "abc123"
- **Comportamiento real:** HTTP 201, el registro fue creado sin validación
- **Relación con auditoría:** Confirma el Hallazgo 1 de la fase anterior / Nuevo bug no detectado en auditoría manual

[Repetir para cada prueba roja]

### Pruebas que pasaron
- ✅ Caso 1 — Creación exitosa de estudiante
- ✅ [...]

### Cobertura de código
- **Líneas cubiertas:** X%
- **Funciones cubiertas:** X%
- **Archivos con 0% de cobertura:** [lista]
```

---

## 📌 Reglas que debes seguir al escribir las pruebas

- **Fechas dinámicas siempre.** Nunca uses fechas hardcodeadas que puedan volverse pasadas
  o futuras con el tiempo. Las fechas pasadas deben ser al menos 1 año atrás. Las fechas
  futuras deben calcularse dinámicamente.

- **Independencia total entre tests.** Si un test necesita un estudiante creado previamente,
  créalo dentro del mismo test o en un `beforeEach`. Nunca dependas de que otro test haya
  corrido antes.

- **No silencies errores.** No uses `try/catch` dentro de las pruebas. Si Supertest lanza
  una excepción, deja que el test falle y reporta el error real.

- **Agrupa por recurso, no por método HTTP.** Los `describe` deben agrupar por recurso
  (`/api/estudiantes`, `/api/asistencias`, `/api/reportes`).


### Ruta de despliegue

https://taller-vibe-api-green-snow-8356.fly.dev
https://taller-vibe-api-green-snow-8356.fly.dev/api/estudiantes