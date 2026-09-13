---
name: code-style
description: Formatea código TypeScript/NestJS manteniendo alineación tabular, objetos en una sola línea y la máxima densidad horizontal posible.
---

# Code Style

## Objetivo

Cuando escribas, refactorices o modifiques cualquier archivo **TypeScript/NestJS** en este proyecto, aplica estrictamente un formato **compacto, horizontal y denso**.

Estas reglas tienen prioridad sobre las reglas multilínea predeterminadas de **Prettier** o linters estándar cuando entren en conflicto con este formato.

## Reglas de formato

### 1. Importaciones en una sola línea

Mantén todos los imports desestructurados en una única línea.

**Correcto:**

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
```

**Incorrecto:**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
```

No dividas imports verticalmente salvo que sea técnicamente imposible.

### 2. Alineación tabular de asignaciones

En bloques contiguos de declaraciones `const` o `let`, alinea verticalmente los signos `=` utilizando espacios.

**Correcto:**

```typescript
const userService = this.userService;
const userRepo    = this.userRepository;
const userMapper  = this.userMapper;
```

La alineación debe facilitar la lectura rápida por columnas.

Aplica esta regla solamente a declaraciones contiguas donde la alineación mejore claramente la legibilidad.

### 3. Objetos literales en una sola línea

Mantén los objetos pequeños y medianos en una única línea siempre que sea razonablemente posible.

**Correcto:**

```typescript
const payload = { sub: user.id, username: user.username };
```

**Incorrecto:**

```typescript
const payload = {
  sub: user.id,
  username: user.username,
};
```

Esto también aplica a:

* Objetos retornados.
* Parámetros de funciones.
* DTOs inline.
* Configuraciones.
* Opciones de métodos.
* Objetos enviados a servicios.

**Correcto:**

```typescript
return { access_token: this.jwtService.sign(payload) };
```

```typescript
return this.userService.create({ name, email, password });
```

### 4. Control de flujo con `if` de una sola instrucción

Cuando el `if` tenga una única instrucción en el cuerpo (por ejemplo, un `throw`), escribe la condición en su propia línea y la instrucción indentada en la línea siguiente, sin llaves.

**Correcto:**

```typescript
if (!user)
  throw new NotFoundException('Usuario no encontrado');
if (!token)
  throw new UnauthorizedException('Token inválido');
```

**Incorrecto:**

```typescript
if (!user) throw new NotFoundException('Usuario no encontrado');
```

```typescript
if (!user) {
  throw new NotFoundException('Usuario no encontrado');
}
```

Cuando el bloque contenga varias instrucciones o su expansión mejore significativamente la legibilidad, utiliza bloques normales con llaves.

### 5. Excepciones compactas

Las excepciones simples deben permanecer en una sola línea.

**Correcto:**

```typescript
throw new UnauthorizedException('Credenciales inválidas');
```

**Incorrecto:**

```typescript
throw new UnauthorizedException(
  'Credenciales inválidas',
);
```

No dividas argumentos simples innecesariamente.

### 6. Firmas de métodos y constructores

Mantén las firmas de métodos, funciones y constructores en una sola línea cuando sea razonablemente posible.

**Correcto:**

```typescript
constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}
```

Evita:

```typescript
constructor(
  private readonly userService: UserService,
  private readonly jwtService: JwtService,
) {}
```

Lo mismo aplica a los parámetros de métodos y funciones.

### 7. Llamadas a funciones compactas

Mantén las llamadas con argumentos simples o moderados en una sola línea.

**Correcto:**

```typescript
const user = await this.userService.findByEmail(email);
```

```typescript
return this.userService.update(id, { name, email, active });
```

No dividas una llamada simplemente para cumplir con el ancho de línea de Prettier.

### 8. Espaciado vertical entre métodos

Dentro de una clase, separa cada método utilizando **exactamente tres saltos de línea**.

Ejemplo:

```typescript
class UserService {

  findAll() {
    return [];
    
  }


  findOne(id: number) {
    return id;
    
  }


  create(data: CreateUserDto) {
    return data;
    
  }

}
```

La separación vertical entre métodos debe ser consistente en todo el archivo.

### 9. Línea en blanco antes del cierre de funciones

Toda función o método debe terminar con una línea en blanco inmediatamente antes de la llave `}`.

**Correcto:**

```typescript
findOne(id: number) {
  const user = this.users.find(user => user.id === id);

  return user;

}
```

**Incorrecto:**

```typescript
findOne(id: number) {
  const user = this.users.find(user => user.id === id);

  return user;
}
```

Esta regla aplica a:

* Métodos de clases.
* Funciones.
* Arrow functions con cuerpo.
* Métodos privados.
* Métodos públicos.
* Handlers de controllers.
* Métodos de services.
* Guards.
* Interceptors.
* Pipes.
* Strategies.
* Repositories.

### 10. Prioridad de densidad horizontal

Cuando existan varias formas válidas de escribir el código, selecciona la que:

1. Utilice menos líneas verticales.
2. Mantenga más información relacionada en la misma línea.
3. Mantenga los objetos inline.
4. Mantenga imports inline.
5. Mantenga argumentos inline.
6. Mantenga las firmas inline.
7. Preserve la legibilidad.

El objetivo es maximizar la **densidad horizontal** sin convertir el código en código ilegible.

### 11. No aplicar formato vertical automático

No conviertas automáticamente código compacto en formato multilínea solamente porque:

* Prettier normalmente lo haría.
* Una línea supera el ancho configurado.
* Un objeto tiene varias propiedades.
* Una llamada tiene varios argumentos.
* Un import tiene varios elementos.
* Un constructor tiene varias dependencias.

La prioridad es este formato compacto.

### 12. Prettier y linters

Si Prettier o un linter intenta transformar el código contradiciendo estas reglas, **mantén el formato definido por esta skill**.

No ejecutes automáticamente una reformateación que destruya:

* Imports horizontales.
* Objetos inline.
* Firmas compactas.
* Llamadas compactas.
* Alineación tabular.
* Espaciado vertical definido por esta skill.

### 13. Sin comentarios docstring

No agregues ni conserves comentarios de documentación tipo JSDoc (`/** ... */`) sobre métodos, funciones o clases. Si el archivo ya tiene uno, elimínalo al tocarlo.

**Incorrecto:**

```typescript
/**
 * Devuelve el usuario dueño del token.
 */
async findMe(id: string) {
  ...
}
```

**Correcto:**

```typescript
async findMe(id: string) {
  ...
}
```

## Regla general

Antes de entregar o modificar código TypeScript/NestJS, verifica:

* [ ] Imports desestructurados en una sola línea.
* [ ] Declaraciones `const`/`let` contiguas alineadas por `=`.
* [ ] Objetos pequeños y medianos en una sola línea.
* [ ] Retornos de objetos en una sola línea.
* [ ] Excepciones simples en una sola línea.
* [ ] `if` de una sola instrucción con la condición en su propia línea y la instrucción indentada debajo, sin llaves.
* [ ] No hay comentarios docstring (JSDoc) sobre métodos, funciones o clases.
* [ ] Firmas compactas.
* [ ] Argumentos compactos.
* [ ] Métodos separados con exactamente tres saltos de línea.
* [ ] Existe una línea en blanco antes de `}` en cada función/método.
* [ ] No se aplicó el formato multilínea estándar de Prettier innecesariamente.

**Esta skill debe aplicarse a todo código TypeScript/NestJS generado, modificado o refactorizado durante la sesión.**
