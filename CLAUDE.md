# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

## Comandos

```bash
npm run start:dev          # modo watch (requiere un MySQL accesible; si no, la app no arranca)
npm run build              # nest build -> dist/
npm run lint               # eslint --fix sobre src y test

npm test                   # jest, rootDir=src, testRegex .*\.spec\.ts$
npm test -- users.service  # una sola suite por subcadena de la ruta
npm test -- -t "should be defined"   # un solo test por nombre
npm run test:e2e           # test/jest-e2e.json (rootDir=test)
```

`.env` está en el `.gitignore` y debe crearse localmente. Claves que lee la app: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. Ojo: `PORT` está declarada en `.env` pero **no** se lee; `main.ts` hace `app.listen(3001)` fijo.

## Arquitectura

NestJS 11 + TypeORM + MySQL. Cuatro módulos de funcionalidad (`users`, `roles`, `auth`, `user-profiles`) más `common/` para lo transversal: `common/decorators/` y `common/filters/`.

### Abstracción de repositorios (la convención principal)

Los servicios nunca tocan TypeORM. Cada recurso define una interfaz de repositorio más un token de inyección `Symbol`, y el módulo vincula el token a una implementación concreta de TypeORM:

- `users/interface/user-repository.interface.ts` — `IUserRepository` + `USER_REPOSITORY_TOKEN`
- `users/repositories/user.repository.ts` — `UserRepository implements IUserRepository`, inyecta `Repository<User>` mediante `@InjectRepository`
- `users/users.module.ts` — `{ provide: USER_REPOSITORY_TOKEN, useClass: UserRepository }`
- `users/users.service.ts` — `@Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository`

Roles y user-profiles replican esto exactamente (`ROLE_REPOSITORY_TOKEN`, `USER_PROFILE_REPOSITORY_TOKEN`; ojo, en ambos el directorio es `interfaces/` frente a `interface/` en users). `user-profiles` es el módulo más completo de los tres y sirve de referencia. `IUserProfileRepository` e `IUserRepository` declaran el borrado con la misma forma (`delete(id): Promise<DeleteResult>`): el repositorio devuelve el `DeleteResult` de TypeORM y es el servicio el que decide el 404 mirando `affected === 0`. Al agregar un recurso, sigue esta estructura. Como la interfaz es una importación solo de tipos usada en un constructor, debe importarse con `import type` / `type IUserRepository`, o los metadatos emitidos por los decoradores rompen la inyección de dependencias.

La forma de las consultas (`relations`, `select`, `where`) vive en el repositorio, no en el servicio; p. ej. `UserRepository.findAll(roleActive?)` hace join con `role` y elige manualmente las columnas devueltas. Ese `select` **no incluye `email`**: se quitó a propósito para que el listado no sea un padrón de correos, dado que cualquiera puede registrarse y obtener un token. No lo vuelvas a agregar.

### Autenticación

`AuthModule` registra `JwtModule` con `registerAsync`, tomando el secreto de `JWT_SECRET` vía `ConfigService` y con `expiresIn: '1h'`, y **lo exporta**. Por eso `UsersModule`, `RolesModule` y `UserProfilesModule` importan `AuthModule`: para que `JwtService` sea inyectable en `AuthGuard`.

`AuthService.login` es real: busca al usuario por correo con `AuthRepository.findByEmailWithPassword` (que hace join con `role` y recupera el `password` pese al `select: false`), compara con `bcrypt.compare`, rechaza a los usuarios inactivos y firma un `JwtPayload` con `{ sub, email, roleId, role }`, donde `role` es el **nombre** del rol.

`AuthGuard` parsea `Authorization: Bearer <token>`, lo verifica y adjunta el payload a `request['user']`. Se declara a nivel de clase en los controladores, así que **protege todo el controlador salvo lo que se marque con `@Public()`** (`common/decorators/public.decorator.ts`), que el guard lee con `reflector.getAllAndOverride`. Hoy el único endpoint público es `POST /users`.

`GET /users/me` devuelve la ficha de la cuenta dueña del token: el id sale de `request['user']` con `@Req()`, nunca de la URL, así que no hay forma de pedir la ficha de otra persona. La ruta `'me'` se declara **antes** de `@Get(':id')` porque Nest resuelve por orden de declaración y `:id` capturaría la palabra `me` como identificador. El `Request` de express se importa con `import type`, por la misma restricción de `emitDecoratorMetadata` que afecta a las interfaces de repositorio.

**No existe autorización por rol.** Había un `RolesGuard` y un decorador `@Roles('ADMIN')` que no restringían nada —el guard devolvía `true` siempre y nadie leía su metadata—, y se eliminaron por decisión explícita en `c266db9`. La autorización disponible es binaria: hay token válido o no lo hay. No reintroduzcas `@Roles` sin acordarlo antes.

### Pipeline de request/response

- El `ValidationPipe` global en `main.ts` usa `whitelist: true, forbidNonWhitelisted: true, transform: true`. Cualquier campo del body no declarado en el DTO produce un 400: los DTOs son el contrato autoritativo de la request. Actualiza los DTOs al agregar campos.
- Los controladores aplican `ClassSerializerInterceptor`; `User.password` está doblemente protegido: `@Exclude()` para la serialización y `select: false` en la columna. `UsersService.create` además lo elimina manualmente antes de devolver.
- `UpdateUserDto` deriva de `CreateUserDto` mediante `PartialType(OmitType(..., ['password']))`, por lo que la contraseña no se puede actualizar vía `PATCH`/`PUT /users/:id`.
- Los filtros booleanos opcionales de query usan `new ParseBoolPipe({ optional: true })` (`GET /users?roleActive=`, `GET /roles?isActive=`).
- `DELETE /users/:id` valida el id con `ParseUUIDPipe` y un `exceptionFactory` propio, porque el mensaje por omisión del pipe está en inglés y la convención del proyecto pide español. El resto de las rutas `:id` de ese controlador todavía recibe el id sin validar.
- `CreateUserDto` **no** declara `roleId`: el rol de creación lo fija siempre el servidor con la constante `ROL_POR_DEFECTO_ID` de `users.service.ts`. Es deliberado, porque `POST /users` es público y aceptar el rol del cliente permitía registrarse como ADMIN. Enviar `roleId` en el body devuelve 400 por `forbidNonWhitelisted`. La constante está cableada a un id concreto de la base de desarrollo, a la espera de que la columna reciba su propio `DEFAULT`.

### Persistencia

`synchronize: true`: el esquema de MySQL se deriva de las entidades al arrancar y no hay migraciones. Modificar una entidad altera directamente la base de datos de desarrollo.

Las propiedades de las entidades están en camelCase y las columnas en snake_case mediante `name:` explícito (`firstName` → `first_name`). `User.roleId` es una FK `int` —del mismo tipo que `roles.id`, como exige MySQL— con un `@ManyToOne` a `Role` unido por `role_id`. `User.isActive` y `Role.isActive` se declaran ambos `{ type: 'boolean' }`, que en MySQL produce `tinyint`; declararlos así es lo que hace que TypeORM hidrate un booleano real y no el `'1'` en texto. Ambas columnas tuvieron tipos equivocados y se corrigieron en `4a0516d` y `b710f97`; el trabajo que queda sobre el esquema está en `PENDIENTES.md`.

Los errores del driver de MySQL **no** se capturan en los servicios. Los traduce un exception filter, `common/filters/query-failed.filter.ts`, que hace `@Catch(QueryFailedError)` y mapea el `errno`: 1062 → `ConflictException`, 1451 → `ConflictException`, 1452 → `ConflictException`, y cualquier otro → `InternalServerErrorException` dejando el error en el log. TypeORM copia las propiedades del error del driver sobre la excepción, así que `errno` se lee directo de ella.

El filtro se registra dos veces, a propósito:

- Global en `AppModule` con `{ provide: APP_FILTER, useValue: new QueryFailedFilter() }`, como red de seguridad con mensajes genéricos. Va con `useValue` y no con `useClass` porque el constructor recibe un objeto de mensajes que Nest no sabe inyectar.
- Por controlador con `@UseFilters(new QueryFailedFilter({ duplicado: ..., referenciado: ..., referenciaInvalida: ... }))`, que es donde vive el texto en español de cada recurso. Nest resuelve método → controlador → global y se queda con el primero que haga match, así que el del controlador gana. Las claves describen la situación de negocio, no el código de MySQL.

Por eso los servicios ya no llevan `try/catch` alrededor de las escrituras, ni el `if (error instanceof NotFoundException) throw error` que hacía falta para que el `catch` no se tragara las excepciones propias. Un servicio solo lanza lo suyo (`NotFoundException`, `ConflictException` de un pre-chequeo). Al agregar un recurso, sigue este esquema en lugar de reintroducir el `try/catch`.

Ojo con una consecuencia: si el servicio verifica antes de escribir —`UsersService.create` hace `findByEmail`, `UserProfilesService.create` hace `findByUserId`— gana ese pre-chequeo y el filtro nunca ve el 1062. El filtro cubre la carrera entre la verificación y el insert, no el caso normal. Por eso `POST /users` con correo repetido responde `El correo ya esta registrado.` y no el mensaje del filtro.

## Estado de los tests

4 de 10 suites unitarias fallan actualmente: `users.service.spec.ts`, `users.controller.spec.ts`, `roles.service.spec.ts` y `roles.controller.spec.ts`. Son el scaffolding del Nest CLI sin modificar (`providers: [UsersService]` sin proveer el token del repositorio) y revientan al resolver la inyección de dependencias. No interpretes un `npm test` fallido como una regresión causada por tu cambio: comprueba si la suite ya estaba rota y provee el mock de `*_REPOSITORY_TOKEN` al tocar una. `user-profiles.service.spec.ts` ya aplica ese patrón y sirve de referencia.

## Convenciones

Los mensajes visibles para el usuario (mensajes de validación, texto de excepciones) y los mensajes de commit se escriben en español. Respeta eso.

ESLint ejecuta `recommendedTypeChecked`. Donde el código choca con él, se usan comentarios `eslint-disable` puntuales (p. ej. las llamadas sin tipar de bcrypt en `users.service.ts`) en lugar de relajar la configuración.

**Prettier no se usa en este proyecto**: se desinstaló y no hay archivo de configuración. No corras `npx prettier` —se descarga solo y aplica sus valores por omisión, que no coinciden con el estilo del código— ni agregues su chequeo a la revisión. El formato lo fija ESLint.

## Idioma y Comunicación
- La documentación interna y comentarios deben estar en español 
**todos los mensajes de error, validaciones de DTOs y respuestas a los usuarios DEBEN ser en español**.
