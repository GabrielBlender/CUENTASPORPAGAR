# 🚀 Guía Rápida: Configurar Vercel Blob Storage

## 📦 ¿Qué es Vercel Blob?

Vercel Blob es el servicio de almacenamiento de archivos de Vercel, diseñado para aplicaciones serverless. Es ideal para almacenar archivos XML, PDF y otros documentos.

## ✅ Ya Instalado

Ya instalamos el paquete necesario:
```bash
npm install @vercel/blob
```

## 🔧 Configuración en Vercel Dashboard

### Paso 1: Crear Blob Store

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto: **CUENTASPORPAGAR**
3. Ve a la pestaña **"Storage"**
4. Click en **"Create Database"** → **"Blob"**
5. Dale un nombre: `cuentas-pagar-files`
6. Click en **"Create"**

### Paso 2: Conectar a tu Proyecto

1. Una vez creado el Blob Store, verás un botón **"Connect to Project"**
2. Selecciona tu proyecto **CUENTASPORPAGAR**
3. Vercel generará automáticamente la variable de entorno:
   - `BLOB_READ_WRITE_TOKEN`

### Paso 3: Verificar Variables de Entorno

Ve a **Settings** → **Environment Variables** y verifica que tengas:

```env
# Generada automáticamente por Vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxx

# Tus otras variables (agrégalas manualmente)
MONGODB_URL=mongodb+srv://Vercel-Admin-mongo-cuentas-pagar:7I7gvNixqBfbux9Z@mongo-cuentas-pagar.6ew44i7.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=cuentas_por_pagar
JWT_SECRET=tu-clave-secreta-de-32-caracteres-minimo
JWT_EXPIRATION=7d
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
```

## 💻 Desarrollo Local

### Opción 1: Sin Blob (Recomendado para desarrollo)

No necesitas configurar nada. El código automáticamente usa `public/uploads/` cuando no detecta `BLOB_READ_WRITE_TOKEN`.

### Opción 2: Con Blob (Para testing)

Si quieres probar Blob en local:

1. Copia el token desde Vercel Dashboard → Settings → Environment Variables
2. Créalo en tu `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxx
```

## 🎯 Cómo Funciona

El sistema es **automático**:

- **Sin `BLOB_READ_WRITE_TOKEN`**: Usa file system local (`public/uploads/`)
- **Con `BLOB_READ_WRITE_TOKEN`**: Usa Vercel Blob Storage

```typescript
// lib/blob-storage.ts - Automático ✨
const USE_VERCEL_BLOB = process.env.BLOB_READ_WRITE_TOKEN !== undefined;
```

## 📝 Crear .env.local para Desarrollo

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
MONGODB_URL="mongodb+srv://Vercel-Admin-mongo-cuentas-pagar:7I7gvNixqBfbux9Z@mongo-cuentas-pagar.6ew44i7.mongodb.net/?retryWrites=true&w=majority"
DATABASE_NAME="cuentas_por_pagar"
JWT_SECRET="genera-una-clave-con-32-caracteres-minimo"
JWT_EXPIRATION="7d"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# BLOB_READ_WRITE_TOKEN (opcional en desarrollo)
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
```

### Generar JWT_SECRET

En PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Probar que Funciona

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Luego sube una factura XML y verifica:
- **Desarrollo**: Archivo en `public/uploads/xml/`
- **Producción**: URL en Vercel Blob (https://xxxxx.public.blob.vercel-storage.com/...)

## 📊 Límites y Precios

**Plan Hobby (Gratuito):**
- 1 GB de almacenamiento
- 100 GB de ancho de banda/mes
- Suficiente para empezar

**Si necesitas más:**
- Upgrade a plan Pro en Vercel

## 🔍 Verificar en Vercel

Después de subir archivos en producción:

1. Ve a Vercel Dashboard → Storage → Blob
2. Verás todos los archivos subidos
3. Puedes descargarlos, eliminarlos, etc.

## ✅ Checklist Final

- [ ] Blob Store creado en Vercel
- [ ] `BLOB_READ_WRITE_TOKEN` en Vercel Environment Variables
- [ ] MongoDB configurado (`MONGODB_URL`)
- [ ] `JWT_SECRET` configurado (diferente en dev y prod)
- [ ] `.env.local` creado para desarrollo local
- [ ] `npm run dev` funciona sin errores

## 🆘 Troubleshooting

**Error: "Missing BLOB_READ_WRITE_TOKEN"**
- Solo en producción. Verifica que el Blob Store esté conectado al proyecto.

**Archivos no se guardan**
- En desarrollo: Verifica que `public/uploads/` sea writable
- En producción: Verifica que `BLOB_READ_WRITE_TOKEN` esté configurado

**URL inválida**
- Vercel Blob devuelve URLs completas: `https://xxxxx.public.blob.vercel-storage.com/...`
- File system devuelve rutas relativas: `/uploads/xml/archivo.xml`
