# Pendientes

Lista única de trabajo pendiente. Funde `HOJA-DE-RUTA-USERS.md` con el informe
`docs/code-review/revision-2026-09-12.adoc`: se quitaron las tareas ya completadas y
las que ambos documentos repetían con distinto nombre.

Verificado sobre `develop` el 2026-09-13. Se retiraron de esta lista los ítems ya
resueltos (modelo de permisos en `GET /users` y en `roles`, `findOne`/`update`
lanzando 404, `PATCH /users/:id/status`, `default: 11` en `User.roleId`, mensaje de
conflicto de `POST /roles`, `first_name`/`last_name` obligatorios); el historial de
esas soluciones sigue en el git log.

## Contrato y consistencia

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
