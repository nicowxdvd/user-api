# Hoja de ruta · Saneamiento del recurso `users`

Documento de trabajo. Registra la auditoría del recurso `users`, la lista completa de
tareas derivadas y el avance. Se actualiza al cerrar cada tarea.

- **Recurso:** tabla `users` (MySQL) y el módulo `src/users/`
- **Fecha de la auditoría:** 2026-09-12
- **Estado general:** Fase 1 completada. Pendiente desde la Fase 2.

---

## 1. Contexto y alcance

El módulo `users` ya está implementado por completo (entidad, DTOs, repositorio,
servicio, controlador, módulo y registro en `AppModule`). Por lo tanto este plan no
construye el recurso: lo **sanea**. El objetivo es cerrar la brecha entre tres
contratos que hoy no coinciden:

1. La DDL real de la tabla en MySQL.
2. La metadata declarada en `src/users/entities/user.entity.ts`.
3. El contrato de entrada expuesto por los DTOs.

La aplicación arranca con `synchronize: true` y sin migraciones. Eso significa que la
entidad no describe la tabla: la define. Cualquier diferencia entre la entidad y el
esquema vivo es un `ALTER TABLE` pendiente que se ejecuta en el siguiente arranque.
Por eso el saneamiento empieza por la entidad y no por el código que la consume.

### Fuera del alcance

- El módulo `roles` y el módulo `user-profiles`, salvo como referencia de convención.
- Los stubs intencionales de autenticación (`AuthService.login` con credenciales
  fijas, `RolesGuard` que siempre retorna `true`, secreto JWT en `auth.module.ts`).
  Están documentados como inconclusos en `CLAUDE.md` y se atienden en otro plan.
- La introducción de migraciones para reemplazar `synchronize`.

---

## 2. Resultado de la auditoría

DDL observada en MySQL, comparada columna por columna contra la entidad.

| # | Columna | Tipo y constraint en la DDL | Declaración en la entidad | Veredicto |
|---|---------|------------------------------|---------------------------|-----------|
| 1 | `id` | varchar(36), NOT NULL, PRI | `@PrimaryGeneratedColumn('uuid')` | Correcto |
| 2 | `email` | varchar(150), NOT NULL, UNI | `{ type:'varchar', length:150, unique:true }` | Correcto |
| 3 | `password` | varchar(255), NOT NULL | `{ type:'varchar', select:false }` | Advertencia W-1 |
| 4 | `first_name` | varchar(255), NULL | `nullable:true`, tipado `string = ''` | Advertencia W-2 |
| 5 | `last_name` | varchar(255), NULL | `nullable:true`, tipado `string \| undefined` | Advertencia W-2 |
| 6 | `is_active` | varchar(255), NOT NULL, DEFAULT `'1'` | `{ type:'varchar', default:true }`, tipado `boolean` | Desvío D-1 |
| 7 | `role_id` | int, NOT NULL, MUL | `{ type:'tinyint' }` | Desvío D-2 |
| 8 | `created_at` | datetime(6), DEFAULT_GENERATED | `@CreateDateColumn` | Correcto |
| 9 | `updated_at` | datetime(6), on update | `@UpdateDateColumn` | Correcto |

Nueve columnas: cuatro correctas, tres advertencias, dos desvíos. El mapeo es
completo (ninguna columna falta ni sobra); el problema es de tipos, no de cobertura.

Un dato de contexto: el orden de columnas en la base (con `password` en primera
posición, antes de `id`) indica que la tabla no fue creada a partir de la entidad.
Es señal de desalineación acumulada entre ambos contratos.

---

## 3. Registro de desvíos y hallazgos

### D-1 · `is_active` almacena texto mientras la propiedad declara `boolean`

- **Ubicación:** `src/users/entities/user.entity.ts:31-32`
- **Hecho:** la columna es `varchar` y guarda `'1'` / `'0'`. La propiedad se tipa
  `boolean | undefined`. TypeORM no convierte entre ambos.
- **Impacto medido:** `User.isActive` no se lee en ninguna decisión de negocio. El
  único uso está en el `select` de `UserRepository.findAll`
  (`src/users/repositories/user.repository.ts:25`). El daño actual está en el
  contrato de la respuesta HTTP: `GET /users` y `GET /users/:id` devuelven
  `"isActive": "1"` en lugar de `true`. `ClassSerializerInterceptor` no lo
  transforma porque no hay ningún `@Transform` declarado.
- **Riesgo latente:** el defecto se vuelve un bug de lógica en cuanto exista la
  primera regla sobre el estado del usuario. El string `'0'` es un valor verdadero
  en una evaluación booleana de JavaScript, y el compilador no puede advertirlo
  porque el tipo declarado afirma que es un `boolean`.
- **Inconsistencia asociada:** `src/roles/entities/role.entity.ts:16` declara la
  misma columna lógica como `{ type: 'boolean' }`. Dos entidades hermanas usan dos
  tipos distintos para el mismo concepto. El filtro por `role.isActive` en
  `UserRepository.findAll` funciona precisamente porque en `Role` el tipo es correcto.

### D-2 · `role_id` declara un tipo distinto al de la PK que referencia

- **Ubicación:** `src/users/entities/user.entity.ts:34-35`
- **Hecho:** la DDL declara `int`; la entidad declara `tinyint`. La PK referenciada
  (`src/roles/entities/role.entity.ts:11`) usa `@PrimaryGeneratedColumn()` sin
  argumentos, que en MySQL produce `int NOT NULL AUTO_INCREMENT`.
- **Impacto:** existe un `ALTER TABLE` pendiente. En el próximo arranque exitoso,
  `synchronize` intentará reducir `role_id` a `tinyint`.
- **Riesgo de arranque, confirmado en la tarea 2.1:** la FK existe
  (`FK_a2cecd1a3531c0b041e29ba46e1`, `role_id` → `roles.id`) y MySQL exige que la
  columna hija y la referenciada tengan tipos compatibles. El `ALTER` a `tinyint`
  falla con error 3780, y un fallo de sincronización aborta el arranque de la
  aplicación. **No arrancar la aplicación antes de completar la Fase 2.**
- **Nota:** corregir 3.1 alineando la entidad a `int` elimina el `ALTER` pendiente
  en lugar de intentar aplicarlo, así que el riesgo de arranque desaparece con la
  corrección.
- **Riesgo de dominio:** `tinyint` con signo tope en 127. Si además la FK no
  existiera, la columna aceptaría en silencio un `role_id` sin rol correspondiente.

### Advertencias

| ID | Descripción | Ubicación |
|----|-------------|-----------|
| W-1 | `password` no declara `length`. Coincide con `varchar(255)` sólo porque ese es el valor por omisión de TypeORM. Es una coincidencia, no una declaración: un cambio de ese valor por omisión alteraría la columna sin que nadie lo pida. | `user.entity.ts:23` |
| W-2 | Nullability incoherente en `first_name` y `last_name`. La columna admite NULL, pero ninguna de las dos propiedades se tipa `\| null` (que es lo que `nullable: true` realmente implica), y entre sí están tipadas distinto: `string = ''` frente a `string \| undefined`. | `user.entity.ts:26-29` |
| W-3 | El esquema es más permisivo que el contrato: `first_name` y `last_name` admiten NULL en la base, pero `CreateUserDto` los exige con `MinLength(3)`. La regla vive en un solo lado y se pierde para cualquier inserción que no pase por la API. | `create-user.dto.ts:13-26` |

### Hallazgos anexos

Detectados al rastrear el uso de las columnas. No pertenecen a la corrección de la
entidad, pero quedan registrados para que no se pierdan.

| ID | Hallazgo | Ubicación | Fase |
|----|----------|-----------|------|
| A-1 | No existe forma de activar o desactivar un usuario a través de la API. `CreateUserDto` no declara `isActive` y `UpdateUserDto` deriva de él, así que la columna nunca se escribe desde la aplicación. El módulo `roles` sí expone un endpoint de cambio de estado. | `users/dto/`, `roles.service.ts:64` | 4 |
| A-2 | `roleId` valida `@Min(0)`, pero `roles.id` es autoincremental y comienza en 1. El valor 0 nunca puede ser válido. | `create-user.dto.ts:34-36` | 4 |
| A-3 | Un `roleId` inexistente produce errno 1452 (`ER_NO_REFERENCED_ROW_2`), que el servicio no traduce. El cliente recibe 500 en lugar de 400 o 409. Relacionado con A-2, que admite un valor que garantiza este error. | `users.service.ts:39-45` | 6 |
| A-4 | `findOne` devuelve `null` sin lanzar `NotFoundException`. Un id inexistente responde 200 con cuerpo vacío. | `users.service.ts:52-54` | 6 |
| A-5 | `update` no verifica existencia previa ni traduce errores del driver. | `users.service.ts:56-58` | 6 |
| A-6 | `remove` es un stub que devuelve un string literal, y `IUserRepository` no declara ningún método de borrado. | `users.service.ts:60-62` | 5, 6 |
| A-7 | `@IsEmail()` no declara mensaje en español, contra la convención del proyecto. | `create-user.dto.ts:29` | 4 |

---

## 4. Hoja de ruta

Cada tarea indica su objetivo, el motivo y el criterio de aceptación que permite
marcarla como cerrada.

### Fase 1 · Auditoría de la entidad contra la DDL — COMPLETADA

- [x] **1.1** Auditar las nueve columnas y registrar los desvíos.
  - *Resultado:* dos desvíos (D-1, D-2), tres advertencias (W-1 a W-3) y siete
    hallazgos anexos (A-1 a A-7), documentados en las secciones 2 y 3.

### Fase 2 · Preparación y seguridad de los datos

Ninguna corrección de tipo empieza antes de cerrar esta fase completa.

- [x] **2.1** Determinar si existe la clave foránea sobre `role_id`, consultando
      `information_schema.KEY_COLUMN_USAGE`.
  - *Por qué:* define si el próximo arranque aplica el `ALTER` de D-2 o si lo
    rechaza y aborta el inicio de la aplicación. También revela si la integridad
    referencial está garantizada por la base o no lo está.
  - *Resultado:* la FK existe. Ver el detalle en la sección 6.
- [x] **2.2** Respaldar la tabla `users` con `mysqldump` antes de cualquier cambio
      de tipo.
  - *Resultado:* **omitida por decisión explícita**, no ejecutada. No existe
    respaldo de la tabla. La tarea 2.3 verificó que la conversión pendiente es
    segura para los datos actuales, pero no hay punto de retorno ante un
    resultado imprevisto.
- [x] **2.3** Inspeccionar los valores reales de `is_active` con un `GROUP BY` y
      normalizar cualquier valor que no sea `'1'` ni `'0'`.
  - *Por qué:* al convertir la columna a un tipo numérico, MySQL castea el
    contenido. `'1'` y `'0'` se convierten bien; cualquier otro texto se vuelve 0
    de forma silenciosa e irreversible.
  - *Resultado:* sin acciones correctivas. Ver el detalle en la sección 6.

### Fase 3 · Corrección de la entidad

El orden interno importa: **D-2 antes de D-1**. D-2 puede impedir el arranque, y se
necesita que `synchronize` corra para poder aplicar y verificar D-1. Invertir el
orden deja un cambio que no se puede probar.

- [x] **3.1** Corregir D-2: alinear el tipo de `role_id` con el tipo real de
      `roles.id`.
  - *Resultado:* resuelto con `{ type: 'int', name: 'role_id' }` explícito. La
    aplicación arranca sin errores de sincronización y la columna es `int`. Ver el
    detalle en la sección 6.
- [x] **3.2** Corregir D-1: declarar `is_active` con el tipo que MySQL usa para un
      valor booleano, y decidir en qué capa vive su valor por omisión.
  - *Por qué el tipo importa:* es lo que hace que la propiedad tipada `boolean`
    deje de mentir y que la respuesta HTTP devuelva `true` en lugar de `"1"`.
  - *Referencia de convención:* `role.entity.ts:16` ya resuelve este mismo caso.
  - *Resultado:* resuelto con `{ type: 'boolean' }`. La columna es `tinyint`, los
    datos se conservaron y `GET /users` devuelve `isActive` como booleano. Ver el
    detalle en la sección 6.
- [x] **3.3** Resolver W-1: declarar `length` en `password` de forma explícita.
  - *Resultado:* **W-1 se acepta, no se corrige.** La columna guarda un hash de
    bcrypt, que mide siempre 60 caracteres, así que los 255 actuales tienen un
    margen amplio y la columna nunca se llena. El riesgo que se había planteado
    (que un cambio del valor por omisión de TypeORM truncara la columna) es
    remoto y estaba sobredimensionado: W-1 es cosmético, no un defecto de
    corrección. Queda el argumento de consistencia con `email`, que sí declara su
    `length`, pero no justifica por sí solo tocar la entidad ahora.
  - *Nota:* no ajustar la columna a 60 para que calce justo. Un hash de argon2
    ronda los 97 caracteres y obligaría a alterarla de nuevo.
- [ ] **3.4** Resolver W-2: homogeneizar la nullability tipada de `first_name` y
      `last_name`, aplicando a ambos la misma decisión.
- [ ] **3.5** Resolver W-3: decidir si los dos nombres son obligatorios y dejar la
      regla expresada en una sola capa.
  - *Cuidado:* pasar una columna a NOT NULL falla si existen filas con NULL.
    Verificar el contenido antes.
- [ ] **3.6** Verificar el esquema resultante con `DESCRIBE users` y confirmar que
      las nueve columnas coinciden con la entidad.

### Fase 4 · Contrato de entrada (DTOs)

- [ ] **4.1** Resolver A-2: corregir el mínimo de `roleId` para que no admita un
      identificador que no puede existir.
- [ ] **4.2** Resolver A-1: definir si `isActive` forma parte del contrato de
      creación, del de actualización, o de un endpoint dedicado de cambio de estado
      como el que ya existe en `roles`.
  - *Por qué:* hoy la columna es inescribible desde la API. Sin esta decisión, no
    hay forma de desactivar un usuario.
- [ ] **4.3** Resolver A-7: agregar el mensaje en español que falta en el validador
      de `email`.
- [ ] **4.4** Revisar que todo campo declarado en los DTOs exista en la entidad.
  - *Por qué:* `ValidationPipe` corre con `whitelist` y `forbidNonWhitelisted`, así
    que los DTOs son el contrato autoritativo de la petición. Un campo no declarado
    produce 400.

### Fase 5 · Capa de acceso a datos

- [ ] **5.1** Verificar que el `select` de `findAll` siga siendo coherente con las
      columnas corregidas.
- [ ] **5.2** Resolver la parte de A-6 que corresponde a esta capa: definir si
      `IUserRepository` necesita un método de borrado y con qué contrato de retorno.
  - *Referencia:* `IUserProfileRepository` ya define uno; seguir esa forma.
- [ ] **5.3** Confirmar que `password` sólo se recupera donde es imprescindible, y
      que `select: false` no fue anulado por ningún `select` explícito.
- [ ] **5.4** Confirmar que el moldeado de consultas (`relations`, `select`, `where`)
      sigue viviendo en el repositorio y no se filtró al servicio.

### Fase 6 · Lógica de negocio (servicio)

- [ ] **6.1** Confirmar que `isActive` se lee y se escribe como booleano después del
      cambio de tipo.
- [ ] **6.2** Resolver A-3: traducir errno 1452 a una excepción HTTP adecuada,
      siguiendo el patrón de traducción de errores del driver ya establecido.
- [ ] **6.3** Resolver A-4: lanzar `NotFoundException` cuando `findOne` no encuentra
      el usuario.
- [ ] **6.4** Resolver A-5: verificar existencia y traducir errores del driver en
      `update`.
- [ ] **6.5** Resolver A-6: implementar `remove` de verdad, contemplando errno 1451
      cuando el usuario tenga registros asociados.
- [ ] **6.6** Revisar el hasheo de la contraseña en `create` y su exclusión de la
      respuesta.

### Fase 7 · Capa HTTP (controlador)

- [ ] **7.1** Verificar los pipes de los parámetros: `id` es un UUID y no un
      entero, así que `ParseIntPipe` no corresponde ahí.
- [ ] **7.2** Verificar que los filtros booleanos de query usen
      `new ParseBoolPipe({ optional: true })`, como en `GET /roles`.
- [ ] **7.3** Confirmar que las rutas estáticas se declaran antes de las
      paramétricas.
- [ ] **7.4** Exponer el endpoint que resulte de la decisión de 4.2, si aplica.

### Fase 8 · Pruebas unitarias

Contexto: seis de ocho suites del proyecto fallan hoy. Son andamiaje del CLI de Nest
que declara `providers: [UsersService]` sin proveer el token del repositorio, y
revientan al resolver la inyección de dependencias. No son una regresión.

- [ ] **8.1** Reparar `users.service.spec.ts` aportando el mock de
      `USER_REPOSITORY_TOKEN`.
  - *Referencia:* `user-profiles.service.spec.ts` ya aplica este patrón.
- [ ] **8.2** Reparar `users.controller.spec.ts` con `overrideGuard(AuthGuard)`.
- [ ] **8.3** Cubrir el caso de correo duplicado (409).
- [ ] **8.4** Cubrir el caso de usuario inexistente en `findOne`, `update` y
      `remove` (404).
- [ ] **8.5** Cubrir que `isActive` viaja como booleano en ambos sentidos.
  - *Por qué:* es la prueba de regresión de D-1. Sin ella, nada impide que el tipo
    vuelva a divergir.
- [ ] **8.6** Cubrir el caso de `roleId` inexistente (A-3).
- [ ] **8.7** Ejecutar `npm test -- users` y dejar las dos suites en verde.

### Fase 9 · Cierre

- [ ] **9.1** Ejecutar `npm run lint`.
- [ ] **9.2** Ejecutar `npm run build`.
- [ ] **9.3** Prueba manual de humo de los endpoints: 201, 400, 404 y 409.
- [ ] **9.4** Confirmar que las respuestas nunca incluyen `password`.
- [ ] **9.5** Actualizar `CLAUDE.md`: la nota sobre `User.isActive` tipado `varchar`
      y la que describe `role_id` como `tinyint` quedan obsoletas al cerrar la
      Fase 3.
- [ ] **9.6** Commit con mensaje en español.

---

## 5. Lista para Todoist

Bloque listo para copiar y pegar. Cada línea con sangría de dos espacios se crea
como subtarea.

```text
- [ ] Fase 2: Preparacion y seguridad de los datos
  - [ ] 2.1 Determinar si existe la FK sobre role_id via information_schema
  - [ ] 2.2 Respaldar la tabla users con mysqldump y verificar la restauracion
  - [ ] 2.3 Inspeccionar y normalizar los valores reales de is_active
- [ ] Fase 3: Correccion de la entidad (D-2 antes de D-1)
  - [ ] 3.1 Corregir D-2: alinear el tipo de role_id con el de roles.id
  - [ ] 3.2 Corregir D-1: declarar is_active con el tipo booleano de MySQL
  - [ ] 3.3 Declarar length explicito en password
  - [ ] 3.4 Homogeneizar la nullability tipada de first_name y last_name
  - [ ] 3.5 Decidir si los nombres son obligatorios y dejar la regla en una sola capa
  - [ ] 3.6 Verificar el esquema con DESCRIBE users
- [ ] Fase 4: Contrato de entrada (DTOs)
  - [ ] 4.1 Corregir el minimo de roleId
  - [ ] 4.2 Definir como se escribe isActive desde la API
  - [ ] 4.3 Agregar el mensaje en espanol al validador de email
  - [ ] 4.4 Revisar que todo campo de los DTOs exista en la entidad
- [ ] Fase 5: Capa de acceso a datos
  - [ ] 5.1 Verificar el select de findAll contra las columnas corregidas
  - [ ] 5.2 Definir si IUserRepository necesita metodo de borrado
  - [ ] 5.3 Confirmar que password solo se recupera donde es imprescindible
  - [ ] 5.4 Confirmar que el moldeado de consultas vive en el repositorio
- [ ] Fase 6: Logica de negocio (servicio)
  - [ ] 6.1 Confirmar que isActive se lee y escribe como booleano
  - [ ] 6.2 Traducir errno 1452 a una excepcion HTTP adecuada
  - [ ] 6.3 Lanzar NotFoundException en findOne
  - [ ] 6.4 Verificar existencia y traducir errores del driver en update
  - [ ] 6.5 Implementar remove contemplando errno 1451
  - [ ] 6.6 Revisar el hasheo de password y su exclusion en la respuesta
- [ ] Fase 7: Capa HTTP (controlador)
  - [ ] 7.1 Verificar el pipe del parametro id: es UUID, no entero
  - [ ] 7.2 Verificar ParseBoolPipe optional en los filtros de query
  - [ ] 7.3 Confirmar el orden de rutas estaticas antes de las parametricas
  - [ ] 7.4 Exponer el endpoint que resulte de la decision de 4.2
- [ ] Fase 8: Pruebas unitarias
  - [ ] 8.1 Reparar users.service.spec.ts con el mock de USER_REPOSITORY_TOKEN
  - [ ] 8.2 Reparar users.controller.spec.ts con overrideGuard(AuthGuard)
  - [ ] 8.3 Cubrir el caso de correo duplicado (409)
  - [ ] 8.4 Cubrir el caso de usuario inexistente (404)
  - [ ] 8.5 Cubrir que isActive viaja como booleano en ambos sentidos
  - [ ] 8.6 Cubrir el caso de roleId inexistente
  - [ ] 8.7 Ejecutar npm test -- users y dejar las suites en verde
- [ ] Fase 9: Cierre
  - [ ] 9.1 Ejecutar npm run lint
  - [ ] 9.2 Ejecutar npm run build
  - [ ] 9.3 Prueba manual de humo: 201, 400, 404, 409
  - [ ] 9.4 Confirmar que las respuestas nunca incluyen password
  - [ ] 9.5 Actualizar las notas obsoletas de CLAUDE.md
  - [ ] 9.6 Commit con mensaje en espanol
```

---

## 6. Registro de decisiones y avance

Anotar aquí el resultado de cada tarea cerrada, sobre todo las verificaciones cuyo
resultado condiciona tareas posteriores.

| Fecha | Tarea | Resultado o decisión |
|-------|-------|----------------------|
| 2026-09-12 | 1.1 | Auditoría cerrada: D-1, D-2, W-1 a W-3, A-1 a A-7. |
| 2026-09-12 | 2.1 | **La FK existe.** Ver el detalle abajo. |
| 2026-09-12 | 2.2 | **Omitida por decisión explícita.** No hay respaldo de la tabla. |
| 2026-09-12 | 2.3 | **Sin acciones correctivas.** Los datos permiten la conversión. Ver el detalle abajo. |
| 2026-09-12 | 3.1 | **D-2 cerrado.** `role_id` declarado como `int` explícito. Ver el detalle abajo. |
| 2026-09-12 | 3.2 | **D-1 cerrado.** `is_active` declarado `boolean`. Verificado extremo a extremo. Ver el detalle abajo. |
| | 3.5 | Pendiente: ¿`first_name` y `last_name` son obligatorios? |
| | 4.2 | Pendiente: ¿cómo se escribe `isActive` desde la API? |

### Detalle de la tarea 2.1 (2026-09-12)

Servidor: MySQL 9.7.1.

Restricción encontrada sobre `users`:

```
CONSTRAINT `FK_a2cecd1a3531c0b041e29ba46e1`
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
```

Conclusiones, en orden de importancia:

1. **La FK existe.** El `MUL` de la DDL es su índice, no un índice suelto. El nombre
   con hash corresponde a la nomenclatura que genera TypeORM, así que la creó
   `@ManyToOne` a través de `synchronize`.
2. **Las tablas están efectivamente gestionadas por `synchronize`.** Lo confirma el
   orden de columnas: en `users`, `password` precede a `id`; en `roles`, `name`
   precede a `id`. Ese desorden es el rastro de columnas agregadas por sync en
   sucesivas iteraciones de las entidades. Por lo tanto el `ALTER` de D-2 está
   realmente pendiente y no es una hipótesis.
3. **El `ALTER` de D-2 fallaría con error 3780.** MySQL exige tipos compatibles
   entre la columna hija y la referenciada. Consecuencia operativa: no arrancar la
   aplicación antes de completar la Fase 2.
4. **La FK no declara `ON DELETE` ni `ON UPDATE`**, por lo que aplica `RESTRICT`.
   Esto explica el errno 1451 al intentar borrar un rol con usuarios asociados, que
   es el error que el proyecto ya traduce a `ConflictException`. Relevante para la
   tarea 6.5.
5. **`roles.id` es `int NOT NULL AUTO_INCREMENT`**, lo que confirma D-2.
6. **`roles.is_active` es `tinyint(1) NOT NULL DEFAULT '1'`.** Prueba directa de que
   `{ type: 'boolean' }` produce `tinyint(1)` en MySQL. Es la referencia de
   convención para la tarea 3.2.
7. **`roles` tiene `AUTO_INCREMENT=11`**, o sea que los identificadores existentes
   van de 1 a 10. Confirma A-2: `@Min(0)` admite un valor que no puede existir.

Pregunta abierta que no se resuelve por consulta a la base: dado que sync administra
la tabla y `role_id` sigue siendo `int`, o la aplicación no ha arrancado con éxito
desde que se escribió `tinyint` en la entidad, o arrancó y el arranque se abortó por
el fallo del `ALTER`.

### Detalle de la tarea 2.3 (2026-09-12)

Estado de los datos al momento de la inspección:

| Consulta | Resultado |
|----------|-----------|
| Total de usuarios | 3 |
| Valores distintos en `is_active` | uno solo: `'1'` (hex `31`, largo 1), en las 3 filas |
| Valores no casteables (`NOT IN ('0','1')`) | 0 |
| `role_id` en uso | 1 (una fila) y 5 (dos filas) |
| `first_name` / `last_name` nulos | 0 |

Conclusiones:

1. **La conversión de `is_active` es segura y no requiere normalización previa.** El
   único valor almacenado es `'1'`, verificado byte a byte con `HEX()`. Se usó
   `HEX()` a propósito: un `'1'` con espacio al final, o un `'１'` de ancho
   completo, se ven idénticos en una salida de texto pero castean a 0. El valor
   `31` confirma que es el ASCII `'1'` limpio.
2. **Ningún usuario ha sido desactivado nunca.** Las tres filas están en `'1'`.
   Confirma A-1 empíricamente: como ningún DTO declara `isActive`, la columna nunca
   se escribe desde la aplicación y todas las filas conservan el valor por omisión.
   La funcionalidad de desactivación no está incompleta: no existe.
3. **`role_id` usa los valores 1 y 5**, ambos dentro del rango de `tinyint`. D-2 no
   está corrompiendo datos hoy. Esto no lo vuelve inofensivo: el problema de D-2 es
   la incompatibilidad de tipos con la FK, que bloquea el arranque, y no el rango
   de los valores almacenados.
4. **No hay nulos en `first_name` ni `last_name`.** Dato de entrada para la tarea
   3.5: declararlos NOT NULL no fallaría por datos preexistentes, así que la
   decisión se resuelve por criterio de dominio y no por restricción técnica.

### Detalle de la tarea 3.1 (2026-09-12)

Corrección aplicada en `src/users/entities/user.entity.ts`: la columna se declara
ahora `{ type: 'int', name: 'role_id' }`, con el mismo tipo que `roles.id`.

Verificación:

- Arranque limpio: `[NestApplication] Nest application successfully started`. Sin
  `QueryFailedError` ni error 3780. El único error posterior es `EADDRINUSE` en el
  puerto 3001, ajeno a la sincronización.
- `information_schema.COLUMNS` confirma `role_id` de tipo `int`.

**Corrección a lo documentado en D-2.** Se había afirmado que el `ALTER` a `tinyint`
fallaría con error 3780 y abortaría el arranque, y que el `@Column` explícito tiene
prioridad sobre el tipo inferido desde `@ManyToOne`. Los hechos observados no lo
respaldan: la columna se mantuvo en `int` mientras la entidad declaraba `tinyint`, y
no hay registro de ningún `ALTER` fallido. Lo más probable es que TypeORM nunca haya
emitido ese `ALTER`. Ese punto queda como predicción no verificada, no como hecho.

Lo que sí está verificado y sostiene la corrección: MySQL exige tipos compatibles
entre la columna hija y la referenciada de una FK, y la entidad declara hoy el mismo
tipo que la columna en la base.

**La pregunta abierta de 2.1 queda sin respuesta.** El proceso que ocupa el puerto
3001 se inició después de aplicar esta corrección, así que no prueba si la
aplicación arrancaba antes del cambio. Para zanjarlo habría que revertir la entidad
a `tinyint` y arrancar de forma controlada.

### Detalle de la tarea 3.2 (2026-09-12)

Corrección aplicada en `src/users/entities/user.entity.ts`: la columna se declara
ahora `{ type: 'boolean', name: 'is_active', default: true }`. El `name`, el
`default` y el tipo de la propiedad no cambiaron.

**Por qué `boolean` y no `tinyint`.** MySQL no tiene un tipo booleano propio:
`BOOLEAN` es sinónimo de `TINYINT(1)`. Las dos declaraciones producen una columna
casi idéntica en la base, pero no son equivalentes para TypeORM. La capa de
hidratación decide si convertir el valor crudo mirando el tipo declarado en la
metadata de la columna:

- Metadata `Boolean`: al leer, el `1` del motor se convierte a `true`; al escribir,
  `true` se convierte a `1`.
- Metadata `String` (el `varchar` anterior): no hay nada que convertir y la
  propiedad tipada `boolean` recibe el string `'1'`.
- Metadata numérica (`tinyint` declarado directamente): tampoco hay conversión, y la
  propiedad recibiría el número `1`. El defecto cambia de forma, no desaparece.

Por eso `boolean` es el único que corrige las dos capas a la vez.

El `default: true` no requirió cambios: sobre una columna booleana genera el mismo
`DEFAULT '1'` que ya tenía la tabla.

Verificación, en los tres niveles del criterio de aceptación:

1. Esquema: `is_active` pasó de `varchar(255)` a `tinyint`, `NOT NULL`, con
   `COLUMN_DEFAULT` 1.
2. Datos: las tres filas conservan el valor 1. Ninguna se degradó a 0, como
   anticipaba la inspección de la tarea 2.3.
3. Contrato HTTP: `GET /users` devuelve `"isActive": true`. Antes devolvía
   `"isActive": "1"`. Este era el defecto real de D-1 y queda cerrado.

Observación menor: la columna quedó como `tinyint` mientras que `roles.is_active`
figura como `tinyint(1)`. La diferencia está en el ancho de visualización, que MySQL
tiene obsoleto desde la versión 8.0.19 y que no afecta al almacenamiento ni a la
hidratación, porque la conversión la decide la metadata de TypeORM y no el ancho
declarado en la tabla.
