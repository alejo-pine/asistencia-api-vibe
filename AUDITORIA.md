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