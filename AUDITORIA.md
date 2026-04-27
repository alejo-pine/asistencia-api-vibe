# Auditoría de la API de Asistencia Estudiantil

A continuación se presentan los hallazgos de la auditoría técnica realizada sobre el código generado:

## Hallazgo 1 — Inyección y Seguridad (CORS)
- **Severidad:** alta
- **Archivo/línea:** src/app.js, línea 14
- **Descripción:** El middleware `cors()` se está llamando sin ninguna configuración de lista de permitidos (whitelisting). Esto habilita por defecto el acceso de lectura y escritura (`*`) desde absolutamente cualquier origen o dominio.
- **Evidencia:** Al inspeccionar el código o hacer peticiones desde una URL arbitraria, los headers permitirán el acceso completo a los métodos expuestos de la API.
- **Impacto:** Posibles ataques desde clientes maliciosos no autorizados donde se intercepte o altere masivamente el estado de la aplicación.

## Hallazgo 2 — Inyección y Seguridad (Limitación de Tasa)
- **Severidad:** alta
- **Archivo/línea:** src/app.js, línea 14
- **Descripción:** La API no implementa un control de límites de tarifa (rate limiting) para evitar la saturación de los endpoints por peticiones repetidas.
- **Evidencia:** Si se ejecuta un ataque automatizado enviando miles de peticiones GET o POST en bucle a `/api/estudiantes`, el servidor intentará procesarlas todas.
- **Impacto:** Alta vulnerabilidad a ataques de denegación de servicio (DoS o DDoS) y estrés exagerado de la base de datos de manera indiscriminada.

## Hallazgo 3 — Datos sensibles
- **Severidad:** alta
- **Archivo/línea:** src/routes/estudiante.routes.js, línea 8
- **Descripción:** No se implementa ningún mecanismo de autenticación (por ejemplo, tokens JWT o sesiones) para proteger los datos de los estudiantes. Los endpoints de obtención de listas retornan los datos como el correo para toda petición no autenticada.
- **Evidencia:** Una simple petición `GET /api/estudiantes` con curl o Postman sin cabeceras extra devolverá la lista completa con información parcial de todos y cada uno de los matriculados.
- **Impacto:** Violación de principios de privacidad y Habeas Data al permitir recolección y filtrado de datos mediante su scraping automático.

## Hallazgo 4 — Configuración (Archivo .env.example)
- **Severidad:** media
- **Archivo/línea:** Raíz del proyecto (README.MD) y variables de entorno.
- **Descripción:** Aunque el `README.MD` sugiere hacer uso del comando `cp .env.example .env` para construir el entorno virtual de producción y prueba, dicho archivo **no** fue generado por la herramienta y es inexistente.
- **Evidencia:** Realizar un listado sobre los directorios (`ls -la`) revela la ausencia de un archivo demostrativo `.env.example`, lo que requiere deducir y destapar el código fuente para conocer los requerimientos de entorno.
- **Impacto:** Baja mantenibilidad y curva de adopción tardía. Se quiebra el paradigma del Twelve-Factor App de manera innecesaria. 

## Hallazgo 5 — Manejo de errores 
- **Severidad:** media
- **Archivo/línea:** src/middlewares/errorHandler.js, línea 7
- **Descripción:** El capturador devuelte un status 500 por defecto y expone incondicionalmente al usuario externo el mensaje subyacente extraído del componente del motor (`err.message`), que para componentes como "better-sqlite3" podría ser una cadena del esquema interno SQL.
- **Evidencia:** Cuando se inyectan variables problemáticas sobre base de datos tras saltarse validaciones a nivel base, se expone en la respuesta JSON algo como `"Error interno del servidor: UNIQUE constraint failed: estudiantes.codigo"`.
- **Impacto:** Fuga de información ligada a la estructura de la base de datos interna y falta de experiencia del usuario real por devoluciones secas en lugar de errores previstos.

## Hallazgo 6 — Manejo de errores y concurrencia (Idempotencia y validaciones)
- **Severidad:** media
- **Archivo/línea:** src/controllers/estudiante.controller.js, línea 31
- **Descripción:** La revisión manual de correos duplicados y códigos se hace usando un select preventivo pero sin usar bloqueos asíncronos ni retener el error emitido de base de datos dentro de control de inserciones. Un fallo por restricción Unique de SQLite resultará en el Error 500 predeterminado mencionado anteriormente.
- **Evidencia:** Al crear de forma asíncrona dos códigos exactos y enviar peticiones a la par, se generará conflicto subyacente provocando que la aplicación mande un 500 interno y no el 409 intencionado en la validación manual.
- **Impacto:** Los clientes de consumo recibirán un engañoso "Error interno del servidor", cuando el único problema remonta a condiciones de negocio incumplidas (Código Estudiantil en uso).

## Hallazgo 7 — Pruebas automatizadas
- **Severidad:** alta
- **Archivo/línea:** package.json, línea 10
- **Descripción:** No se autogeneraron pruebas unitarias ni de integración como parte de los estándares para validar regresiones según lo requerido. El script predeterminado indica que no hay tests configurados.
- **Evidencia:** Ejecutar `npm run test`, emite el output: `"echo \"Error: no test specified\" && exit 1"`.
- **Impacto:** La evolución paulatina para nuevas implementaciones generará regresiones no rastreables. Las refactorizaciones tienen alto factor de riesgo inminente en los controladores.

## Hallazgo 8 — Dependencias
- **Severidad:** baja
- **Archivo/línea:** package.json, línea 32 (dependencias de desarrollo)
- **Descripción:** El uso de una dependencia autogenerada `@flydotio/dockerfile@0.7.10` en el proyecto introduce vulnerabilidades de bajo nivel correspondientes con el uso colateral de la librería dependiente `diff`.
- **Evidencia:** Al ejecutar externamente `npm audit`, detecta la existencia de las 2 vulnerabilidades de bajo impacto indicando un "Depends on vulnerable versions of diff". 
- **Impacto:** Posibles vulnerabilidades derivadas durante la etapa de despliegues productivos. Incremento de vectores imprevistos ante herramientas automáticas ajenas a los requerimientos centrales.

---

## Bugs confirmados por pruebas

**Fecha de ejecución:** 2026-04-26
**Total de casos de prueba escritos:** 15 (20 funciones de test — los casos 2, 7 y 9 incluyen sub-variantes)
**Pruebas que pasaron (verde):** 20
**Pruebas que fallaron (rojo):** 0

### Resultado general

Ninguna de las 20 pruebas falló. Esto no equivale a afirmar que el sistema carece de bugs; significa que los 15 escenarios descritos no lograron poner en evidencia fallos en el flujo de ejecución del código tal como está escrito hoy. A continuación se detalla lo que las pruebas *sí* confirmaron y lo que permanece fuera del alcance de la suite.

### Comportamientos confirmados como correctos por las pruebas

- ✅ Caso 1 — Creación exitosa: `POST /api/estudiantes` retorna 201 con `id` y `codigo` dentro de `result`.
- ✅ Caso 2a — `codigo: "abc123"` rechazado con 400 (no comienza con EST).
- ✅ Caso 2b — `codigo: "EST1"` rechazado con 400 (menos de 5 dígitos).
- ✅ Caso 2c — `codigo: "EST000001"` rechazado con 400 (6 dígitos, excede el límite).
- ✅ Caso 2d — `codigo: "est00001"` rechazado con 400 (la regex es case-sensitive).
- ✅ Caso 3 — Código duplicado devuelve 409 correctamente.
- ✅ Caso 4 — BD vacía devuelve `[]`, no `null` ni error.
- ✅ Caso 5 — Listado refleja exactamente los registros insertados.
- ✅ Caso 6 — `GET /api/estudiantes/99999` devuelve 404 con campo `error`.
- ✅ Caso 7a — Body vacío `{}` rechazado con 400 (express-validator detecta campos `undefined` como vacíos).
- ✅ Caso 7b — Payload sin `nombre` rechazado con 400.
- ✅ Caso 8 — Asistencia válida con fecha pasada retorna 201.
- ✅ Caso 9a — Estado `"tardanza"` rechazado con 400 (no está en el enum).
- ✅ Caso 9b — Estado `"PRESENTE"` rechazado con 400 (el enum es estrictamente case-sensitive).
- ✅ Caso 10 — Fecha de mañana (calculada dinámicamente) rechazada con 400.
- ✅ Caso 11 — Segunda asistencia con mismo `estudianteId` + `fecha` retorna 409.
- ✅ Caso 12 — Historial devuelve 3 registros ordenados por `fecha DESC`.
- ✅ Caso 13 — Historial de `id=99999` devuelve 404 con campo `error`, no array vacío.
- ✅ Caso 14 — Reporte de ausentismo con BD vacía retorna 200 y `[]`, sin error 500.
- ✅ Caso 15 — Top 5 retorna exactamente 5 elementos en orden DESC; el primero es el de 10 ausencias; cada elemento tiene `nombre`, `codigo` y `cantidad_ausencias`.

### Hallazgos de auditoría que las pruebas no pueden confirmar ni refutar

- **Hallazgo 6 (Race condition):** La condición de carrera entre el `SELECT` de unicidad y el `INSERT` en `estudiante.controller.js` (líneas 35-40) es estructuralmente real, pero las pruebas son secuenciales y no pueden dispararla. El escenario requeriría dos peticiones simultáneas. Las pruebas corren con 409 porque el check manual funciona en contexto de un solo proceso.

- **Hallazgo 5 (Fuga de esquema en errores):** El `errorHandler.js` expone `err.message` directamente. Las pruebas nunca causan un 500 porque los datos de prueba siempre son válidos o el código los rechaza antes. La cobertura del errorHandler quedó en **33.33 %** — la función existe en el módulo pero su cuerpo no se ejerció en ningún test.

- **Bug latente detectado por cobertura (no por fallo):** El bloque `catch` de `getAll` en `estudiante.controller.js` (línea 9) y el bloque `catch` de `create` en la misma ruta tienen 0 % de cobertura de rama. Un error de BD no gestionado (p. ej. tabla corrupta) devolvería el mensaje crudo de SQLite al cliente, confirmando el Hallazgo 5 de la auditoría manual.

### Cobertura de código

```
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------|---------|----------|---------|---------|-------------------
All files                  |   90.41 |    69.23 |   88.88 |   90.41 |
 src/app.js                |   93.75 |      100 |       0 |   93.75 | 22
 src/controllers           |   86.88 |    85.71 |     100 |   86.88 |
  asistencia.controller.js |   89.65 |       90 |     100 |   89.65 | 12,37,54
  estudiante.controller.js |      84 |       75 |     100 |      84 | 9,23-25,45
  reportes.controller.js   |   85.71 |      100 |     100 |   85.71 | 9
 src/database/db.js        |    90.9 |       50 |     100 |    90.9 | 32
 src/middlewares           |   71.42 |    33.33 |      50 |   71.42 |
  errorHandler.js          |   33.33 |        0 |       0 |   33.33 | 3-9
  validators.js            |     100 |      100 |     100 |     100 |
 src/models                |     100 |      100 |     100 |     100 |
 src/routes                |     100 |      100 |     100 |     100 |
---------------------------|---------|----------|---------|---------|-------------------
```

- **Líneas cubiertas:** 90.41 %
- **Funciones cubiertas:** 88.88 %
- **Ramas cubiertas:** 69.23 %
- **Archivos con cobertura notable baja:**
  - `src/middlewares/errorHandler.js` — **33.33 %** (ningún test provocó un error 500; el middleware existe pero su lógica nunca se ejecutó durante las pruebas)
  - `src/app.js` — **93.75 %** — la línea 22 (handler de ruta desconocida) no fue invocada porque todos los tests usan rutas válidas