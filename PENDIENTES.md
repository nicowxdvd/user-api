# Pendientes

Lista de trabajo pendiente para este repo.

## Funcionalidad nueva

- [ ] `POST /auth/forgot-password` + `POST /auth/reset-password`: recuperación de
  contraseña por token de un solo uso. Diseño acordado (sesión 2026-09-13): tabla propia
  `password_reset_tokens` (no columnas en `User`), token opaco de 32 bytes generado con
  `crypto.randomBytes`, se guarda solo su hash (`sha256`), expira a los 30 minutos, se
  invalida al usarse y se invalidan los anteriores del mismo usuario al pedir uno nuevo.
  Todo el flujo vive dentro de `auth/` (entidad, repositorio, DTOs) porque `AuthModule` no
  puede importar `UsersModule` sin generar un ciclo (`UsersModule` ya importa
  `AuthModule`). `IAuthRepository` gana `updatePassword(userId, hashedPassword)`. Las dos
  rutas responden siempre el mismo mensaje genérico exista o no el correo/token, para que
  no sirvan de enumeración de cuentas. Falta agregar rate limit (`@nestjs/throttler`) en
  `/forgot-password` antes de exponerlo.

  **Modo de trabajo (acordado 2026-09-13): esta tarea la programa el usuario, no Claude.**
  Claude guía paso a paso: indica qué archivo crear, qué método agregar, qué línea o
  validación implementar, uno a la vez, y el usuario escribe el código y pregunta. Claude
  no debe adelantarse a escribir la implementación completa.

- [ ] Correos transaccionales: bienvenida al registrarse (`POST /users`), el de
  recuperación de contraseña de arriba, y aviso cuando cambia el correo o la contraseña de
  la cuenta (`PATCH`/`PUT /users/:id` con `email` nuevo, y el futuro `reset-password`).
  Modelo de la infraestructura acordado, ver "Arquitectura de email" abajo.

## Arquitectura de email

Para que sumar cada correo nuevo no implique tocar el servicio que lo dispara:

- Los servicios (`UsersService`, `AuthService`, ...) no llaman a ningún `MailService`
  directo. Emiten un evento de dominio con `@nestjs/event-emitter`
  (`EventEmitterModule.forRoot()` global en `AppModule`) después de que la escritura ya se
  confirmó, nunca antes: no se notifica algo que todavía puede fallar. Ej.:
  `user.registered`, `password-reset.requested`, `user.email-changed`,
  `user.password-changed`. Cada evento es una clase tipada, definida junto al módulo que
  lo emite (`users/events/`, `auth/events/`), no en un archivo compartido.
- Un `MailModule` nuevo, independiente, escucha esos eventos con `@OnEvent(...)` y arma el
  correo. Los servicios de negocio no lo importan; es `MailModule` el que depende de los
  tipos de evento de cada módulo, nunca al revés, así que no hay ciclos.
- Adentro de `MailModule`: `IMailService` + token de inyección (mismo patrón que los
  repositorios) envolviendo `nodemailer`, para poder cambiar de SMTP a SES/Sendgrid sin
  tocar los listeners. Plantillas como template literal simple, una función por correo;
  migrar a un motor tipo Handlebars (`@nestjs-modules/mailer`) solo si una plantilla se
  complica de verdad.
- Un listener nunca deja escapar la excepción hacia arriba: va envuelto en try/catch
  propio y loguea el error. Si el envío de un correo falla, la escritura que lo disparó ya
  se guardó y no debe verse afectada.
- Variables nuevas en `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `MAIL_FROM`, `FRONTEND_URL` (para armar el link de reset).
- Camino de escalado, no construir todavía: si aparece envío masivo (import de usuarios,
  campañas), `EventEmitter2` no alcanza (sin persistencia ni reintentos). Se resuelve
  cambiando el listener por un consumer de cola (`@nestjs/bullmq` + Redis) sin tocar el
  punto donde se emite el evento.

## Limpieza técnica

- [ ] Eliminar `@UseInterceptors(ClassSerializerInterceptor)` de `UsersController`. Es
  redundante: los métodos ya usan `select: false` en TypeORM (password nunca se trae de la
  DB) y `create()` elimina manualmente el password. El interceptor + `@Exclude()` es defensa
  en profundidad innecesaria que suma ruido visual. Retirar el decorador a nivel clase,
  quitar `@Exclude()` de la entidad `User`, y el `import` de `ClassSerializerInterceptor`
  del controlador.

- [ ] Simplificar `QueryFailedFilter`: hardcodear los mensajes dentro del método
  `traducir()` (no como parámetro del constructor). Registrar global en `main.ts` con
  `app.useGlobalFilters(new QueryFailedFilter())` sin necesidad de decoradores. Eliminar
  todos los `@UseFilters(new QueryFailedFilter({ ... }))` de los controladores. Los
  mensajes son estáticos (no cambian en tiempo de ejecución), así que una fuente de verdad
  en `traducir()` es suficiente. Si hay que cambiar un mensaje, se edita el filtro.

- [ ] Validación consistente de IDs: `DELETE /users/:id` usa `ParseUUIDPipe` pero
  `GET /users/:id`, `PATCH /users/:id` y `PUT /users/:id` reciben el id sin validar.
  Crear un pipe reutilizable como propiedad de clase en el controlador y aplicarlo a
  todos los métodos con parámetro `:id` (GET, PATCH, PUT, DELETE). Mismo en otros
  controladores (`roles`, `user-profiles`). Asegura formato UUID válido en todas las
  rutas antes de llegar al servicio.

  ## Permisos y Autorización

- [ ] Explorar implementación de rol **superuser** y permisos comodín. Actualmente los
  permisos se declaran en decoradores (`@RequirePermissions('users:list')`), lo que ata
  cambios a releases. Diseñar cómo un rol SUPERUSER con permiso `*` (wildcard) saltaría
  todas las validaciones de PermissionsGuard. Considerar si es mejor:
  - Agregar lógica en `PermissionsGuard.canActivate()` para detectar `*` o `SUPERUSER`
  - O asignar en la DB todos los permisos específicos al rol SUPERUSER (menos escalable)
  - Futuro: permisos dinámicos en config/DB en lugar de decoradores.

## Nota sobre el esquema

No hay migraciones: con `synchronize: true` el esquema se deriva de las entidades en cada
arranque. Cualquier cambio de columna vive en el decorador `@Column` y no en SQL suelto,
que se pierde al reiniciar.
