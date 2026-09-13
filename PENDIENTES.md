# Pendientes

Lista única de trabajo pendiente. Funde `HOJA-DE-RUTA-USERS.md` con el informe
`docs/code-review/revision-2026-09-12.adoc`: se quitaron las tareas ya completadas y
las que ambos documentos repetían con distinto nombre.

Verificado sobre `develop` el 2026-09-12.

## Seguridad

- [ ] `GET /users` sigue listando a todos los usuarios para cualquier cuenta con token,
  y el registro es público: crear una cuenta descartable alcanza para obtener la lista
  completa de nombres. El correo ya no se expone —se quitó del `select` de `findAll`—,
  así que lo que queda es una decisión de producto: cerrar el registro público, o
  reintroducir autorización por rol. Para el caso de uso habitual, que cada cuenta lea
  sus propios datos, ya está `GET /users/me`. (`users.controller.ts:50`)

## Funcionalidad rota

- [ ] Borrar un usuario deja huérfano su perfil. `user_profiles.user_id` es un `varchar`
  suelto: la entidad no declara `@ManyToOne` hacia `User` y la base tampoco tiene la
  foreign key —la única que existe es `users.role_id → roles`—, así que nada impide que
  quede una fila apuntando a un usuario que ya no está. Decidir entre declarar la
  relación con `onDelete: 'CASCADE'` o borrar el perfil junto con el usuario dentro de
  una transacción. Mientras esa FK no exista, el errno 1451 que traduce
  `QueryFailedFilter` no se dispara nunca para este caso.
- [ ] `findOne` devuelve `null` en vez de lanzar `NotFoundException`: un id inexistente
  responde 200 con cuerpo vacío. (`users.service.ts:62`)
- [ ] `update` no verifica que el usuario exista: un id inexistente responde 200 con
  cuerpo vacío, igual que `findOne`. Los errores del driver ya no son problema suyo,
  los traduce `QueryFailedFilter`. (`users.service.ts:66`)
- [ ] No hay forma de activar ni desactivar un usuario desde la API: ningún DTO declara
  `isActive`, así que la columna nunca se escribe y todas las filas conservan el valor
  por omisión. Decidir si va en el DTO de actualización o en un endpoint de cambio de
  estado, como el que ya expone `roles`.

## Contrato y consistencia

- [ ] El id del rol por defecto está cableado: `ROL_POR_DEFECTO_ID = 11` en
  `users.service.ts`. En otra base ese id es otro rol, y si no existe, el insert falla
  con errno 1452; desde que existe `QueryFailedFilter` el cliente recibe un 409 con
  «El rol indicado no existe» en vez de un 500, pero el id sigue cableado. Lo acordado
  es mover el valor por omisión al `@Column` de `User.roleId`, porque con
  `synchronize: true` un `DEFAULT` puesto a mano con `ALTER TABLE` no sobrevive al
  siguiente arranque.
- [ ] `POST /roles` perdió el nombre del rol en el mensaje de conflicto. Antes decía
  `El rol 'ADMIN' ya existe.`, interpolando el dato de la request; ahora responde
  `Ya existe un rol con ese nombre`, porque el mensaje lo fija `QueryFailedFilter` a
  nivel de controlador y un filtro no ve el DTO. Se descartó recuperar el nombre
  leyendo el `sqlMessage` de MySQL, que ataría el código al texto de error del driver.
  La salida limpia es un pre-chequeo `findByName` en `RolesService.create`, como el
  `findByEmail` que ya hace `UsersService.create`; exige sumar `findByName` a
  `IRoleRepository` y su implementación. Decidir si el nombre en el mensaje justifica
  el viaje extra a la base. (`roles.controller.ts`, `roles.service.ts`)
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
- [ ] 1 advertencia de lint: una promesa sin await en `main.ts:18`. Es lo único que
  queda; los 6 errores por acceso a `error.code`/`error.errno` en
  `user-profiles.service.ts` y las directivas `eslint-disable` sin uso de
  `users.service.ts` desaparecieron al quitar los `try/catch` que los motivaban.
- [ ] Archivos de herramientas versionados: `.claude/.headroom_wrap_marker.json`,
  `.serena/project.yml` y `.serena/.gitignore`. El primero solo guarda un PID que
  cambia en cada sesión, así que ensucia `git status` de forma permanente. Van al
  `.gitignore` con `git rm --cached`.

## Nota sobre el esquema

No hay migraciones: con `synchronize: true` el esquema se deriva de las entidades en
cada arranque. Cualquier cambio de columna vive en el decorador `@Column` y no en SQL
suelto, que se pierde al reiniciar.
