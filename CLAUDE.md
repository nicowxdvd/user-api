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

`.env` está en el `.gitignore` y debe crearse localmente. Claves que lee la app: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. (`JWT_SECRET` también está en `.env` pero **no** se lee; ver Autenticación más abajo).

## Arquitectura

NestJS 11 + TypeORM + MySQL. Tres módulos de funcionalidad (`users`, `roles`, `auth`) más `common/` para guards y decoradores transversales.

### Abstracción de repositorios (la convención principal)

Los servicios nunca tocan TypeORM. Cada recurso define una interfaz de repositorio más un token de inyección `Symbol`, y el módulo vincula el token a una implementación concreta de TypeORM:

- `users/interface/user-repository.interface.ts` — `IUserRepository` + `USER_REPOSITORY_TOKEN`
- `users/repositories/user.repository.ts` — `UserRepository implements IUserRepository`, inyecta `Repository<User>` mediante `@InjectRepository`
- `users/users.module.ts` — `{ provide: USER_REPOSITORY_TOKEN, useClass: UserRepository }`
- `users/users.service.ts` — `@Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository`

Roles replica esto exactamente (`ROLE_REPOSITORY_TOKEN`; ojo, aquí el directorio es `interfaces/` frente a `interface/` en users). Al agregar un recurso, sigue esta estructura. Como la interfaz es una importación solo de tipos usada en un constructor, debe importarse con `import type` / `type IUserRepository`, o los metadatos emitidos por los decoradores rompen la inyección de dependencias.

La forma de las consultas (`relations`, `select`, `where`) vive en el repositorio, no en el servicio; p. ej. `UserRepository.findAll(roleActive?)` hace join con `role` y elige manualmente las columnas devueltas.

### Autenticación

`AuthModule` registra `JwtModule` y **lo exporta**, de modo que `UsersModule` y `RolesModule` importan `AuthModule` únicamente para que `JwtService` sea inyectable en `AuthGuard`. `AuthGuard` parsea `Authorization: Bearer <token>`, lo verifica y adjunta el payload a `request['user']`.

Hay dos stubs intencionalmente sin terminar, no descuidos que haya que sortear:
- `AuthService.login` compara contra credenciales hardcodeadas (`nico` / `_nico_123`) y firma `{ sub: 1, ... }`. No consulta la tabla de usuarios ni bcrypt.
- `RolesGuard` (`common/decorators/guards/roles.guard.ts`) siempre devuelve `true` y hace `console.log` de la request. El decorador `@Roles('ADMIN')` establece el metadato `'roles'`, pero nada lo lee, así que las restricciones por rol no se aplican actualmente.

El secreto JWT está hardcodeado en `auth.module.ts`, no se obtiene de la configuración.

### Pipeline de request/response

- El `ValidationPipe` global en `main.ts` usa `whitelist: true, forbidNonWhitelisted: true, transform: true`. Cualquier campo del body no declarado en el DTO produce un 400: los DTOs son el contrato autoritativo de la request. Actualiza los DTOs al agregar campos.
- Los controladores aplican `ClassSerializerInterceptor`; `User.password` está doblemente protegido: `@Exclude()` para la serialización y `select: false` en la columna. `UsersService.create` además lo elimina manualmente antes de devolver.
- `UpdateUserDto` deriva de `CreateUserDto` mediante `PartialType(OmitType(..., ['password']))`, por lo que la contraseña no se puede actualizar vía `PATCH`/`PUT /users/:id`.
- Los filtros booleanos opcionales de query usan `new ParseBoolPipe({ optional: true })` (`GET /users?roleActive=`, `GET /roles?isActive=`).

### Persistencia

`synchronize: true`: el esquema de MySQL se deriva de las entidades al arrancar y no hay migraciones. Modificar una entidad altera directamente la base de datos de desarrollo.

Las propiedades de las entidades están en camelCase y las columnas en snake_case mediante `name:` explícito (`firstName` → `first_name`). `User.roleId` es una FK `tinyint` con un `@ManyToOne` a `Role` unido por `role_id`. Ojo: `User.isActive` está declarado como `{ type: 'varchar' }` pese a estar tipado como `boolean`; es una discrepancia real, así que no asumas que se lee y escribe como booleano.

Los errores del driver de MySQL se traducen a excepciones HTTP dentro de los servicios inspeccionando `error.code` / `error.errno`: `ER_DUP_ENTRY`/1062 → `ConflictException`, `ER_ROW_IS_REFERENCED_2`/1451 → `ConflictException`. Sigue ese patrón en lugar de dejar escapar los errores del driver.

## Estado de los tests

6 de 8 suites unitarias fallan actualmente. Son el scaffolding del Nest CLI sin modificar (`providers: [UsersService]` sin proveer el token del repositorio) y revientan al resolver la inyección de dependencias. Solo pasan `app.controller.spec.ts` y otra más. No interpretes un `npm test` fallido como una regresión causada por tu cambio: comprueba si la suite ya estaba rota y provee el mock de `*_REPOSITORY_TOKEN` al tocar una.

## Convenciones

Los mensajes visibles para el usuario (mensajes de validación, texto de excepciones) y los mensajes de commit se escriben en español. Respeta eso.

ESLint ejecuta `recommendedTypeChecked`. Donde el código choca con él, se usan comentarios `eslint-disable` puntuales (p. ej. las llamadas sin tipar de bcrypt en `users.service.ts`) en lugar de relajar la configuración.

## Idioma y Comunicación
- La documentación interna y comentarios deben estar en español 
**todos los mensajes de error, validaciones de DTOs y respuestas a los usuarios DEBEN ser en español**.
