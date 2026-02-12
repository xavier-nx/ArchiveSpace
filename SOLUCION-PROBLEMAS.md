# 🔧 SOLUCIÓN DE PROBLEMAS

## ❌ Problema 1: Login se queda cargando

### Causa:
El servidor no está respondiendo correctamente a la petición de login.

### Solución:

1. **Verificar que el servidor esté corriendo:**
```bash
npm start
```

Deberías ver:
```
✅ Conexión exitosa a MySQL
╔═══════════════════════════════════════════════╗
║   🗂️  SISTEMA ARCHIVÍSTICO                    ║
╠═══════════════════════════════════════════════╣
║   Servidor corriendo en:                      ║
║   http://localhost:3000                       ║
╚═══════════════════════════════════════════════╝
```

2. **Verificar la conexión a MySQL:**
   - Abre MySQL Workbench
   - Conecta a tu servidor
   - Verifica que la base de datos `sistema_archivistico` exista

3. **Verificar las credenciales en `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI    # ← Verifica esto
DB_NAME=sistema_archivistico
```

4. **Reiniciar el servidor:**
```bash
# Presiona Ctrl+C para detener
# Luego ejecuta de nuevo:
npm start
```

5. **Limpiar caché del navegador:**
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Caché" y "Cookies"
   - Limpia y recarga la página

6. **Verificar en la Consola del Navegador:**
   - Presiona `F12` en el navegador
   - Ve a la pestaña "Console"
   - Busca errores en rojo
   - Si ves errores de CORS o 500, hay un problema con el servidor

---

## ❌ Problema 2: Al ver archivos de una carpeta, salen todos los archivos

### Causa:
El backend o frontend no está filtrando correctamente por carpeta.

### Solución:

1. **Verifica que la ruta del backend esté correcta:**

Abre `routes/archivos.js` y verifica que esta ruta existe:

```javascript
// Obtener archivos de una carpeta ESPECÍFICA
router.get('/carpeta/:carpetaId', requireAuth, async (req, res) => {
    try {
        const { carpetaId } = req.params;

        const [archivos] = await db.query(`
            SELECT a.*, u.nombre_completo as subido_por_nombre
            FROM archivos a
            LEFT JOIN usuarios u ON a.subido_por = u.id
            WHERE a.carpeta_id = ?    ← ESTO FILTRA POR CARPETA
            ORDER BY a.fecha_subida DESC
        `, [carpetaId]);
        
        // ...
    }
});
```

2. **Verifica que el frontend llame a la ruta correcta:**

Abre `public/js/app.js` y busca la función `cargarArchivosDeCarpeta`:

```javascript
async function cargarArchivosDeCarpeta(carpetaId) {
    const response = await fetch(`/api/archivos/carpeta/${carpetaId}`);
    //                                      ↑ IMPORTANTE: /carpeta/
}
```

3. **Reinicia el servidor después de cambios:**
```bash
# Presiona Ctrl+C
npm start
```

4. **Prueba manualmente la ruta:**
   
Abre en el navegador (después de iniciar sesión):
```
http://localhost:3000/api/archivos/carpeta/1
```

Deberías ver un JSON con SOLO los archivos de la carpeta con ID 1.

---

## ❌ Problema 3: Código duplicado en archivos.js

### Causa:
Hubo un error al editar el archivo.

### Solución:

**Reemplaza el archivo completo:**

1. Descarga el nuevo ZIP actualizado
2. Reemplaza `/routes/archivos.js` con el del ZIP
3. Reinicia el servidor

O copia manualmente el contenido del archivo desde el repositorio actualizado.

---

## ✅ Verificación Rápida

Ejecuta este checklist:

```
☐ MySQL está corriendo
☐ La base de datos existe (sistema_archivistico)
☐ Los usuarios están creados (ejecuta: node crear-usuarios.js)
☐ El .env tiene las credenciales correctas
☐ El servidor está corriendo (npm start)
☐ No hay errores en la consola del servidor
☐ No hay errores en la consola del navegador (F12)
☐ Puedes acceder a http://localhost:3000
```

---

## 🧪 Prueba Paso a Paso

### Test 1: Login
1. Abre `http://localhost:3000`
2. Usuario: `admin` / Contraseña: `admin123`
3. ¿Entra directo al dashboard? ✅

### Test 2: Ver Carpetas
1. Deberías ver las carpetas en tarjetas
2. ¿Se ven correctamente? ✅

### Test 3: Ver Archivos de UNA Carpeta
1. Click en "Ver Archivos" de cualquier carpeta
2. Cambia a la sección "Archivos"
3. El título dice "Archivos de: XXX-123"
4. ¿Solo muestra archivos de ESA carpeta? ✅
5. Click en "Volver a Carpetas"
6. ¿Regresa a carpetas? ✅

### Test 4: Subir Archivo
1. En una carpeta, click "Subir"
2. Selecciona archivo, autor, fecha
3. Click "Guardar"
4. ¿Se subió correctamente? ✅

### Test 5: Editar Autor
1. En la tabla de archivos, click en botón amarillo
2. Cambia el nombre del autor
3. ¿Se actualiza? ✅

---

## 📞 Soporte Adicional

Si sigues teniendo problemas:

1. **Revisa los logs del servidor** en la terminal donde ejecutaste `npm start`
2. **Revisa la consola del navegador** (F12 → Console)
3. **Toma screenshot** del error y compártelo
4. **Verifica la versión de Node.js**: `node --version` (debe ser 14+)
5. **Reinstala dependencias**:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

**¡La mayoría de los problemas se solucionan reiniciando el servidor!** 🔄
