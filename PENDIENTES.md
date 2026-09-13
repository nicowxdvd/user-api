# Pendientes

Lista única de trabajo pendiente. Funde `HOJA-DE-RUTA-USERS.md` con el informe
`docs/code-review/revision-2026-09-12.adoc`: se quitaron las tareas ya completadas y
las que ambos documentos repetían con distinto nombre.

Verificado sobre `develop` el 2026-09-13. Se retiraron de esta lista los ítems ya
resueltos (modelo de permisos en `GET /users` y en `roles`, `findOne`/`update`
lanzando 404, `PATCH /users/:id/status`, `default: 11` en `User.roleId`, mensaje de
conflicto de `POST /roles`, `first_name`/`last_name` obligatorios, puerto vía `PORT`
en `main.ts`, `users.service.spec.ts`/`users.controller.spec.ts` reparados,
`auth.guard.spec.ts` con `JwtService`/`Reflector` reales, `bootstrap().catch(...)` en
`main.ts`); el historial de esas soluciones sigue en el git log.

## Contrato y consistencia

- [ ] Los mensajes del `ValidationPipe` salen en inglés (`property X should not
  exist`), contra la convención del proyecto. Se resuelve con un `exceptionFactory` en
  el pipe global. (`main.ts`)
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

Sin ítems pendientes por ahora. Se resolvió el versionado accidental de archivos de
herramientas (`.claude/.headroom_wrap_marker.json`, `.serena/project.yml`,
`.serena/.gitignore`): ver git log.

## Nota sobre el esquema

No hay migraciones: con `synchronize: true` el esquema se deriva de las entidades en
cada arranque. Cualquier cambio de columna vive en el decorador `@Column` y no en SQL
suelto, que se pierde al reiniciar.
