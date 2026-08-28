# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev          # watch mode (requires a reachable MySQL — app fails to boot otherwise)
npm run build              # nest build -> dist/
npm run lint               # eslint --fix over src, test

npm test                   # jest, rootDir=src, testRegex .*\.spec\.ts$
npm test -- users.service  # single suite by path substring
npm test -- -t "should be defined"   # single test by name
npm run test:e2e           # test/jest-e2e.json (rootDir=test)
```

`.env` is gitignored and must be created locally. Keys read by the app: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. (`JWT_SECRET` is also present in `.env` but is **not** read — see Auth below.)

## Architecture

NestJS 11 + TypeORM + MySQL. Three feature modules (`users`, `roles`, `auth`) plus `common/` for cross-cutting guards and decorators.

### Repository abstraction (the main convention)

Services never touch TypeORM. Each resource defines a repository interface plus a `Symbol` injection token, and the module binds the token to a concrete TypeORM implementation:

- `users/interface/user-repository.interface.ts` — `IUserRepository` + `USER_REPOSITORY_TOKEN`
- `users/repositories/user.repository.ts` — `UserRepository implements IUserRepository`, injects `Repository<User>` via `@InjectRepository`
- `users/users.module.ts` — `{ provide: USER_REPOSITORY_TOKEN, useClass: UserRepository }`
- `users/users.service.ts` — `@Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository`

Roles mirror this exactly (`ROLE_REPOSITORY_TOKEN`, note the directory is `interfaces/` here vs `interface/` for users). When adding a resource, follow this shape. Because the interface is a type-only import used in a constructor, it must be imported with `import type` / `type IUserRepository` or emitted decorator metadata breaks DI.

Query-shaping (`relations`, `select`, `where`) lives in the repository, not the service — e.g. `UserRepository.findAll(roleActive?)` joins `role` and hand-picks the returned columns.

### Auth

`AuthModule` registers `JwtModule` and **exports it**, so `UsersModule` and `RolesModule` import `AuthModule` purely to make `JwtService` injectable into `AuthGuard`. `AuthGuard` parses `Authorization: Bearer <token>`, verifies it, and attaches the payload to `request['user']`.

Two things are intentionally-unfinished stubs, not oversights to work around:
- `AuthService.login` compares against hardcoded credentials (`nico` / `_nico_123`) and signs `{ sub: 1, ... }`. It does not consult the users table or bcrypt.
- `RolesGuard` (`common/decorators/guards/roles.guard.ts`) always returns `true` and `console.log`s the request. The `@Roles('ADMIN')` decorator sets `'roles'` metadata but nothing reads it, so role restrictions are currently not enforced.

The JWT secret is hardcoded in `auth.module.ts`, not sourced from config.

### Request/response pipeline

- Global `ValidationPipe` in `main.ts` uses `whitelist: true, forbidNonWhitelisted: true, transform: true`. Any body field not declared on the DTO is a 400 — DTOs are the authoritative request contract. Update DTOs when adding fields.
- Controllers apply `ClassSerializerInterceptor`; `User.password` is protected twice over: `@Exclude()` for serialization and `select: false` on the column. `UsersService.create` also strips it manually before returning.
- `UpdateUserDto` derives from `CreateUserDto` via `PartialType(OmitType(..., ['password']))`, so passwords are not updatable through `PATCH`/`PUT /users/:id`.
- Optional boolean query filters use `new ParseBoolPipe({ optional: true })` (`GET /users?roleActive=`, `GET /roles?isActive=`).

### Persistence

`synchronize: true` — the MySQL schema is derived from entities at boot and there are no migrations. Changing an entity mutates the dev database directly.

Entity properties are camelCase, columns are snake_case via explicit `name:` (`firstName` → `first_name`). `User.roleId` is a `tinyint` FK with a `@ManyToOne` to `Role` joined on `role_id`. Note `User.isActive` is declared `{ type: 'varchar' }` despite being typed `boolean` — a real mismatch, so don't assume it round-trips as a boolean.

MySQL driver errors are translated to HTTP exceptions inside services by inspecting `error.code` / `error.errno`: `ER_DUP_ENTRY`/1062 → `ConflictException`, `ER_ROW_IS_REFERENCED_2`/1451 → `ConflictException`. Follow that pattern rather than letting driver errors escape.

## State of the tests

6 of 8 unit suites currently fail. They are unmodified Nest CLI scaffolding (`providers: [UsersService]` with no repository token provided) and blow up on DI resolution. Only `app.controller.spec.ts` and one other pass. Do not read a failing `npm test` as a regression from your change — check whether the suite was already broken, and provide the `*_REPOSITORY_TOKEN` mock when touching one.

## Conventions

User-facing messages (validation messages, exception text) and commit messages are written in Spanish. Match that.

ESLint runs `recommendedTypeChecked`. Where the codebase fights it, it uses targeted `eslint-disable` comments (e.g. bcrypt's untyped calls in `users.service.ts`) rather than loosening the config.

## Idioma y Comunicación
- La documentación interna y comentarios deben estar en español 
**todos los mensajes de error, validaciones de DTOs y respuestas a los usuarios DEBEN ser en español**.
