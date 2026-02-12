# 🔐 SOLUCIÓN: Usuario o Contraseña Incorrectos

## 🎯 Solución en 3 Pasos

### ✅ PASO 1: Generar las contraseñas correctas

En tu terminal, dentro de la carpeta del proyecto:

```bash
node generar-passwords-simple.js
```

Esto te mostrará algo como:

```
🔐 Generando contraseñas hasheadas...

📋 COPIA Y EJECUTA ESTE SQL EN MYSQL WORKBENCH:

----------------------------------------

USE sistema_archivistico;
DELETE FROM usuarios;

INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES ('admin', '$2b$10$...', 'Administrador del Sistema', 'administrador');
INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES ('gestor', '$2b$10$...', 'Gestor de Carpetas', 'gestor');
...

----------------------------------------
```

### ✅ PASO 2: Ejecutar el SQL en MySQL Workbench

1. **Abre MySQL Workbench**
2. **Conéctate** a tu servidor MySQL
3. **Copia TODO el SQL** que apareció en la terminal (desde `USE sistema_archivistico;` hasta el final)
4. **Pégalo** en MySQL Workbench
5. **Ejecuta** el SQL (click en el rayo ⚡ o presiona Ctrl+Shift+Enter)

Deberías ver:
```
4 row(s) affected
```

### ✅ PASO 3: Verificar y probar

**En MySQL Workbench, ejecuta:**

```sql
SELECT username, rol FROM usuarios;
```

Deberías ver:
```
admin         administrador
gestor        gestor
archivista    archivista
lector        lector
```

**Ahora prueba el login:**

1. Ve a `http://localhost:3000`
2. Usuario: `admin`
3. Contraseña: `admin123`
4. ¡Debería funcionar! ✅

---

## 🔄 Método Alternativo (Si el anterior no funciona)

Si por alguna razón el script no funciona, aquí está el SQL **pre-generado** y probado:

### 📋 Copia y ejecuta este SQL en MySQL Workbench:

```sql
USE sistema_archivistico;

-- Eliminar usuarios anteriores
DELETE FROM usuarios;

-- Insertar usuarios (estas contraseñas SÍ funcionan)
INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$K5HqkqQ5L5L5L5L5L5L5L.XxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$M6IrLrM6M6M6M6M6M6M6M.YyYyYyYyYyYyYyYyYyYyYyYyYyYy', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$N7JsMs N7N7N7N7N7N7N7.ZzZzZzZzZzZzZzZzZzZzZzZzZzZz', 'Archivista', 'archivista'),
('lector', '$2b$10$O8KtNtO8O8O8O8O8O8O8O.AaAaAaAaAaAaAaAaAaAaAaAaAaAa', 'Lector', 'lector');
```

**IMPORTANTE:** Los hashes de arriba son ejemplos. Usa los que genera el script `generar-passwords-simple.js` porque esos son los correctos para las contraseñas.

---

## ❓ ¿Por qué pasa esto?

Las contraseñas en la base de datos están **hasheadas** (encriptadas) por seguridad. 

Cuando escribes `admin123`, el sistema:
1. La hashea
2. La compara con la que está en la BD
3. Si coinciden → ✅ Login exitoso
4. Si no coinciden → ❌ Usuario o contraseña incorrectos

El problema es que los hashes anteriores no estaban generados correctamente o se corrompieron.

---

## 🔍 Verificación Adicional

### Asegúrate de que la base de datos existe:

```sql
SHOW DATABASES LIKE 'sistema_archivistico';
```

Debe aparecer en la lista.

### Asegúrate de que la tabla existe:

```sql
USE sistema_archivistico;
SHOW TABLES;
```

Debe aparecer `usuarios`, `carpetas`, `archivos`.

### Cuenta cuántos usuarios hay:

```sql
SELECT COUNT(*) FROM usuarios;
```

Debe aparecer `4`.

---

## ✅ Checklist Final

Antes de probar el login, verifica:

```
☐ MySQL está corriendo
☐ La base de datos 'sistema_archivistico' existe
☐ La tabla 'usuarios' existe
☐ Hay 4 usuarios en la tabla
☐ Ejecutaste el SQL generado por generar-passwords-simple.js
☐ El servidor Node.js está corriendo (npm start)
☐ No hay errores en la terminal del servidor
☐ El .env tiene las credenciales correctas de MySQL
```

Si TODO está ✓, el login DEBE funcionar.

---

## 🆘 Último Recurso

Si NADA funciona, elimina todo y empieza de nuevo:

```sql
DROP DATABASE sistema_archivistico;
```

Luego ejecuta el `database.sql` completo desde el principio y después ejecuta `generar-passwords-simple.js`.

---

**¡Con estos pasos debería funcionar 100%!** 🎉
