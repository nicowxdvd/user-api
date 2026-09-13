# Users API

API de usuarios, roles y permisos construida con NestJS 11, TypeORM y MySQL.

## Requisitos

- Node.js
- MySQL accesible

## Instalación

```bash
npm install
```

Crear un archivo `.env` en la raíz (no se versiona) con:

```
JWT_SECRET=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
PORT=
```

## Uso

```bash
npm run start:dev   # modo watch, requiere MySQL accesible
npm run build        # compila a dist/
npm run lint         # eslint --fix
```

## Tests

```bash
npm test              # unitarios
npm run test:e2e      # end-to-end
```

## Documentación de la API (Swagger)

Con la app corriendo, la documentación interactiva está en:

```
http://localhost:<PORT>/api
```

## Más detalles

La arquitectura, convenciones y decisiones del proyecto están documentadas en `CLAUDE.md`.
