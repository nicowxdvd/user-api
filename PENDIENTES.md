# Pendientes

Lista única de trabajo pendiente. Funde `HOJA-DE-RUTA-USERS.md` con el informe
`docs/code-review/revision-2026-09-12.adoc`: se quitaron las tareas ya completadas y
las que ambos documentos repetían con distinto nombre.

Verificado sobre `develop` el 2026-09-12.

## Seguridad

- [ ] `GET /users` devuelve el directorio completo a cualquier cuenta con token, y el
  registro es público: crear una cuenta descartable alcanza para volcar el correo,
  nombre, rol y fechas de todos los usuarios. Ya no hay autorización por rol, así que
  hay que resolverlo por otra vía: recortar lo que devuelve `findAll`, restringir a
  que cada quien lea lo suyo, o cerrar el registro público. Las dos últimas son
  decisiones de producto. (`users.controller.ts:36`)

## Funcionalidad rota

- [ ] `PATCH /users/:id` exige el cuerpo completo, o sea que no es un `PATCH`. Los
  campos de `CreateUserDto` tienen inicializador (`firstName: string = ''`) y con
  `transform: true` llegan como cadena vacía, así que `@IsNotEmpty` dispara aunque el
  campo no se haya enviado. Se arregla quitando los inicializadores y declarando las
  propiedades con `!` o como opcionales. (`create-user.dto.ts`)
- [ ] `DELETE /users/:id` no borra nada y responde como si hubiera funcionado.
  `UsersService.remove` devuelve el literal `This action removes a #${id} user`,
  además en inglés; `IUserRepository` no declara método de borrado; y el parámetro usa
  `ParseIntPipe` cuando el id es un UUID. Contemplar errno 1451 si el usuario tiene
  registros asociados. `IUserProfileRepository.delete` es la referencia de forma.
  (`users.service.ts:61`, `users.controller.ts:59`)
- [ ] `findOne` devuelve `null` en vez de lanzar `NotFoundException`: un id inexistente
  responde 200 con cuerpo vacío. (`users.service.ts:53`)
- [ ] `update` no verifica que el usuario exista ni traduce los errores del driver.
  (`users.service.ts:57`)
- [ ] No hay forma de activar ni desactivar un usuario desde la API: ningún DTO declara
  `isActive`, así que la columna nunca se escribe y todas las filas conservan el valor
  por omisión. Decidir si va en el DTO de actualización o en un endpoint de cambio de
  estado, como el que ya expone `roles`.

## Contrato y consistencia

- [ ] El id del rol por defecto está cableado: `ROL_POR_DEFECTO_ID = 11` en
  `users.service.ts`. En otra base ese id es otro rol, y si no existe, el insert falla
  con errno 1452, que nadie traduce y el cliente recibe 500. Lo acordado es mover el
  valor por omisión al `@Column` de `User.roleId`, porque con `synchronize: true` un
  `DEFAULT` puesto a mano con `ALTER TABLE` no sobrevive al siguiente arranque.
- [ ] `first_name` y `last_name` admiten NULL en la base, pero `CreateUserDto` los
  exige con `MinLength(3)` y las propiedades de la entidad están tipadas distinto entre
  sí (`string = ''` frente a `string | undefined`). Decidir si son obligatorios y dejar
  la regla en una sola capa. No hay filas con NULL, así que pasarlos a NOT NULL no
  rompe datos: la decisión es de dominio, no técnica.
- [ ] Los mensajes del `ValidationPipe` salen en inglés (`property X should not
  exist`), contra la convención del proyecto. Se resuelve con un `exceptionFactory` en
  el pipe global. (`main.ts`)
- [ ] `main.ts` ignora la variable `PORT` y hace `app.listen(3001)` fijo. Cuidado al
  corregirlo: el puerto 3000 que declara `.env` lo ocupa un Next.js en esta máquina.

## Deuda técnica

- [ ] 4 de 10 suites fallan: `users.service`, `users.controller`, `roles.service` y
  `roles.controller`. Son scaffolding del CLI de Nest, con `providers: [XService]`
  pelado y sin mock del token de repositorio. `user-profiles.service.spec.ts` ya aplica
  el patrón correcto. Al repararlas, cubrir correo duplicado (409), usuario inexistente
  (404) e `isActive` como booleano en ambos sentidos.
- [ ] `auth.guard.spec.ts` hace `new AuthGuard()` pero el constructor pide dos
  argumentos (`JwtService` y `Reflector`). `npm run build` no lo detecta porque
  `tsconfig.build.json` excluye los specs.
- [ ] 6 errores de lint en `user-profiles.service.ts` (líneas 28, 79 y 99), por el
  acceso a `error.code` y `error.errno`. Le falta el `eslint-disable` de cabecera que
  sí tienen `users.service.ts` y `roles.service.ts`. Son los únicos errores del
  proyecto.
- [ ] 3 advertencias de lint: dos directivas `eslint-disable` sin uso en
  `users.service.ts` (líneas 1 y 28) y una promesa sin await en `main.ts:18`.
- [ ] `npx prettier --check src/` falla en 45 archivos. Mientras siga así, el formato no
  sirve como señal en las revisiones.
- [ ] Archivos de herramientas versionados: `.claude/.headroom_wrap_marker.json`,
  `.serena/project.yml` y `.serena/.gitignore`. El primero solo guarda un PID que
  cambia en cada sesión, así que ensucia `git status` de forma permanente. Van al
  `.gitignore` con `git rm --cached`.

## Nota sobre el esquema

No hay migraciones: con `synchronize: true` el esquema se deriva de las entidades en
cada arranque. Cualquier cambio de columna vive en el decorador `@Column` y no en SQL
suelto, que se pierde al reiniciar.
