# 🔧 SOLUCIÓN: Error de Login - Usuario o Contraseña Incorrectos

## ⚡ Solución Rápida (Opción 1 - RECOMENDADA)

### Paso 1: Ejecutar el script de creación de usuarios

```bash
node crear-usuarios.js
```

Este script automáticamente:
- ✅ Elimina los usuarios anteriores
- ✅ Crea los 4 usuarios con contraseñas correctamente hasheadas
- ✅ Muestra las credenciales al finalizar

### Paso 2: Reiniciar el servidor

```bash
npm start
```

### Paso 3: Iniciar sesión

Usa estas credenciales:
- **admin** / **admin123**
- **gestor** / **gestor123**
- **archivista** / **archivista123**
- **lector** / **lector123**

---

## 🔄 Solución Manual (Opción 2)

Si la Opción 1 no funciona, ejecuta esto en MySQL Workbench:

### Paso 1: Eliminar usuarios existentes

```sql
USE sistema_archivistico;
DELETE FROM usuarios;
```

### Paso 2: Insertar usuarios con contraseñas hasheadas

```sql
INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGqL3rZvNxmHDGjIYhRVWYu', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$YZl7mZhXZJR6K6kn9Y7MZ.X8RqGJ9rWDjdGqXCBHxH8qWEJrX9X.W', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$8K4J5.kPqHxGQiNZ7N8xZ.jF8WvQJZH5xMN9kLQ7R8X6tF4wQ8X.W', 'Archivista', 'archivista'),
('lector', '$2b$10$2K8J9.qRsIyHRlOA8O9yA.kH9XwRKAI6yNO0mMR8S9Y7uG5xR9Y.X', 'Lector', 'lector');
```

### Paso 3: Verificar que se crearon

```sql
SELECT username, rol FROM usuarios;
```

Deberías ver los 4 usuarios.

---

## 🔍 Verificación

Para verificar que todo está bien, ejecuta en MySQL:

```sql
SELECT id, username, nombre_completo, rol, activo FROM usuarios;
```

Deberías ver algo como:

```
+----+------------+---------------------------+---------------+--------+
| id | username   | nombre_completo           | rol           | activo |
+----+------------+---------------------------+---------------+--------+
|  1 | admin      | Administrador del Sistema | administrador |      1 |
|  2 | gestor     | Gestor de Carpetas        | gestor        |      1 |
|  3 | archivista | Archivista                | archivista    |      1 |
|  4 | lector     | Lector                    | lector        |      1 |
+----+------------+---------------------------+---------------+--------+
```

---

## ❓ Problemas Comunes

### "Cannot find module 'bcrypt'" al ejecutar crear-usuarios.js

Solución:
```bash
npm install
```

### "Access denied for user" al ejecutar crear-usuarios.js

Solución: Verifica tu archivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=sistema_archivistico
```

### "Unknown database 'sistema_archivistico'"

Solución: Primero ejecuta el script de base de datos:
```bash
mysql -u root -p < database.sql
```

O en MySQL Workbench, ejecuta todo el contenido de `database.sql`

---

## ✅ Después de Solucionar

1. Inicia el servidor: `npm start`
2. Abre `http://localhost:3000`
3. Usa: **admin** / **admin123**

¡Debería funcionar! 🎉
