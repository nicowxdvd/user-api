# Pendientes

Lista única de trabajo pendiente. Funde `HOJA-DE-RUTA-USERS.md` con el informe
`docs/code-review/revision-2026-09-12.adoc`: se quitaron las tareas ya completadas y
las que ambos documentos repetían con distinto nombre.

Verificado sobre `develop` el 2026-09-12.

## Seguridad

- [x] `GET /users` seguía listando a todos los usuarios para cualquier cuenta con
  token, y el registro es público: crear una cuenta descartable alcanzaba para obtener
  la lista completa de nombres. El correo ya no se expone —se quitó del `select` de
  `findAll`—, así que lo que quedaba era una decisión de producto: cerrar el registro
  público, o reintroducir autorización. Para el caso de uso habitual, que cada cuenta
  lea sus propios datos, ya está `GET /users/me`. Se descartó cerrar el registro y
  también hardcodear un nombre de rol (`ADMIN`), porque los roles son administrables:
  se pueden renombrar, borrar o crear roles nuevos que necesiten el mismo acceso.
  Resuelto con un modelo de permisos propio, desacoplado del nombre del rol: entidad
  `Permission` + relación N:M con `Role` vía tabla puente `role_permissions`, módulo
  `permissions` completo (mismo patrón interfaz+token+repositorio que `roles` y
  `user-profiles`), `JwtPayload.permissions: string[]` armado en `AuthService.login`
  con los permisos activos del rol, y `PermissionsGuard` + `@RequirePermissions()`
  (mismo mecanismo `SetMetadata`+`Reflector` que `@Public()`). `GET /users` ahora exige
  el permiso `users:list`. Se cubrió además el hueco de que cualquier cuenta pudiera
  otorgarse permisos a sí misma: `POST /permissions`, `PATCH /permissions/:id/status`,
  `DELETE /permissions/:id` y `PATCH /roles/:id/permissions` exigen
  `permissions:manage`, con un escape de arranque en frío en el guard (un permiso sin
  asignar a ningún rol todavía deja pasar; se cierra apenas se asigna una vez) para no
  dejar el sistema sin forma de configurarse. Sigue sin gate de permiso, igual que
  antes: `POST /roles`, `DELETE /roles/:id` y `PATCH /roles/:id/status`, solo token
  válido. (`users.controller.ts`, `auth/permissions.guard.ts`, `permissions/`)
- [ ] `POST /roles`, `DELETE /roles/:id` y `PATCH /roles/:id/status` quedaron fuera del
  alcance del punto anterior: cualquier cuenta con token válido todavía puede crear,
  borrar o activar/desactivar roles, sin exigir `permissions:manage` ni ningún otro
  permiso. Decidir si conviene gatearlos igual que se hizo con `PATCH
  /roles/:id/permissions`. (`roles.controller.ts`)

## Funcionalidad rota

- [x] `findOne` devuelve `null` en vez de lanzar `NotFoundException`: un id inexistente
  responde 200 con cuerpo vacío. (`users.service.ts:62`)
- [x] `update` no verifica que el usuario exista: un id inexistente responde 200 con
  cuerpo vacío, igual que `findOne`. Los errores del driver ya no son problema suyo,
  los traduce `QueryFailedFilter`. (`users.service.ts:66`)
- [x] No hay forma de activar ni desactivar un usuario desde la API: ningún DTO declara
  `isActive`, así que la columna nunca se escribe y todas las filas conservan el valor
  por omisión. Decidir si va en el DTO de actualización o en un endpoint de cambio de
  estado, como el que ya expone `roles`. Resuelto con `PATCH /users/:id/status`, mismo
  patrón que `RolesController.toggleStatus`.

## Contrato y consistencia

- [x] El id del rol por defecto está cableado: `ROL_POR_DEFECTO_ID = 11` en
  `users.service.ts`. En otra base ese id es otro rol, y si no existe, el insert falla
  con errno 1452; desde que existe `QueryFailedFilter` el cliente recibe un 409 con
  «El rol indicado no existe» en vez de un 500, pero el id sigue cableado. Lo acordado
  es mover el valor por omisión al `@Column` de `User.roleId`, porque con
  `synchronize: true` un `DEFAULT` puesto a mano con `ALTER TABLE` no sobrevive al
  siguiente arranque. Resuelto: `default: 11` en el `@Column`, constante eliminada del
  servicio. El id sigue cableado, solo cambió de lugar.
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

## Funcionalidad nueva

- [ ] `POST /users` no manda correo de bienvenida al crear la cuenta. Acordado hasta
  ahora: emitirlo recién después del `await this.userRepository.save(...)` en
  `UsersService.create` (nunca antes, para no notificar un registro que todavía puede
  fallar), desacoplado del request con `@nestjs/event-emitter` en vez de una llamada
  directa a un `MailService` dentro del propio `create`. La plantilla arranca como un
  template literal simple (un solo correo, el de bienvenida); migrar a un motor tipo
  Handlebars (`@nestjs-modules/mailer`) solo si aparece un segundo o tercer correo.
  Pendiente de decidir si el registro masivo es un escenario real: si lo es, el
  `EventEmitter2` no alcanza (sin persistencia, sin backpressure, sin reintentos) y
  hay que pasar a una cola (`@nestjs/bull`/`@nestjs/bullmq` con Redis), que agrega
  Redis como infraestructura nueva al proyecto. Revisar al final.

## Deuda técnica

- [ ] 2 de 10 suites fallan: `users.service` y `users.controller`. Son scaffolding del
  CLI de Nest, con `providers: [XService]` pelado y sin mock del token de repositorio.
  `roles.service.spec.ts` y `roles.controller.spec.ts` ya se repararon (mock del token
  y `overrideGuard`) al tocarlas por el trabajo de permisos; `user-profiles.service.spec.ts`
  sigue siendo la referencia del patrón. Al reparar las dos que quedan, cubrir correo
  duplicado (409), usuario inexistente (404) e `isActive` como booleano en ambos
  sentidos.
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
