# Apuntes

## TypeORM: cómo leer `@ManyToOne`

Se lee desde la entidad donde está el decorador: "muchos `PasswordResetToken` uno `User`".
El decorador siempre va del lado "muchos" (el que tiene la FK física, `user_id`), y su
argumento es una función que devuelve la clase del lado "uno".
