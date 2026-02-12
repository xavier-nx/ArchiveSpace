# 🚀 Inicio Rápido - Sistema Archivístico

Esta es una guía simplificada para poner el sistema en funcionamiento en 5 minutos.

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Configurar MySQL

### Crear la base de datos:

```bash
mysql -u root -p
```

Dentro de MySQL:
```sql
CREATE DATABASE sistema_archivistico;
USE sistema_archivistico;
SOURCE database.sql;
```

O simplemente:
```bash
mysql -u root -p < database.sql
```

## Paso 3: Generar Contraseñas

```bash
node generate-password.js
```

Copia el SQL que aparece al final y ejecútalo en MySQL.

## Paso 4: Configurar .env

Edita el archivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=sistema_archivistico
DB_PORT=3306

PORT=3000
SESSION_SECRET=alguna_clave_secreta_larga
```

## Paso 5: Iniciar Servidor

```bash
npm start
```

## Paso 6: Abrir en Navegador

Abre: `http://localhost:3000`

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## ✅ Verificación Rápida

1. ¿Ves la pantalla de login? ✓
2. ¿Puedes iniciar sesión con admin/admin123? ✓
3. ¿Ves el dashboard con el menú? ✓
4. ¿Puedes crear una carpeta? ✓

Si todos los puntos están bien, ¡el sistema está funcionando! 🎉

---

## 🔧 Problemas Comunes

### No puedo conectar a MySQL
- Verifica que MySQL esté corriendo
- Confirma usuario y contraseña en `.env`
- Prueba: `mysql -u root -p` en terminal

### El puerto 3000 está en uso
- Cambia `PORT=3001` en `.env`

### No aparecen los usuarios
- Ejecuta de nuevo el SQL de `generate-password.js`

---

**¿Necesitas más ayuda?** Consulta el README.md completo.
