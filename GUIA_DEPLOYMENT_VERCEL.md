# 🚀 Guía Completa de Deployment - Vercel + GitHub

## ✅ Paso 1: Código en GitHub (En Proceso)

### 1.1 Autenticación GitHub CLI
```powershell
# Ya ejecutado - completa en el navegador
gh auth login
# Código: 26D4-DBAE
# Sigue las instrucciones en: https://github.com/login/device
```

### 1.2 Push del Código
Una vez autenticado, ejecuta:
```powershell
cd "c:\Users\gfuentes\OneDrive - Union Group\Documentos\Proyectos\CUENTASPORPAGAR"
git push -u origin main
```

Verifica en: https://github.com/GabrielBlender/CUENTASPORPAGAR

---

## 🌐 Paso 2: Desplegar en Vercel

### 2.1 Importar Proyecto desde GitHub

1. Ve a: https://vercel.com/new
2. Click en **"Import Git Repository"**
3. Busca y selecciona: **GabrielBlender/CUENTASPORPAGAR**
4. Click en **"Import"**

### 2.2 Configurar el Proyecto

**Framework Preset:** Next.js (auto-detectado)
**Root Directory:** `./` (raíz)
**Build Command:** `npm run build` (auto)
**Output Directory:** `.next` (auto)

### 2.3 Configurar Variables de Entorno

**ANTES de hacer Deploy**, click en **"Environment Variables"** y agrega:

#### Variables Requeridas:

```env
# MongoDB Atlas
MONGODB_URL
mongodb+srv://Vercel-Admin-mongo-cuentas-pagar:7I7gvNixqBfbux9Z@mongo-cuentas-pagar.6ew44i7.mongodb.net/?retryWrites=true&w=majority

# Database Name
DATABASE_NAME
cuentas_por_pagar

# JWT Secret (genera uno NUEVO para producción)
JWT_SECRET
[Genera uno nuevo - ver abajo]

# JWT Config
JWT_ALGORITHM
HS256

JWT_EXPIRATION
7d

# NextAuth
NEXTAUTH_URL
https://tu-proyecto.vercel.app

NEXTAUTH_SECRET
[Mismo que JWT_SECRET o genera otro]
```

#### Generar JWT_SECRET para Producción:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**IMPORTANTE:** Usa uno diferente al de desarrollo.

### 2.4 Conectar Vercel Blob Storage

Después de crear el proyecto en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Storage"** tab
3. Click en **"Connect Store"**
4. Selecciona tu Blob Store existente: **almacenamiento-cuentas-pagar**
5. Click en **"Connect"**

Vercel agregará automáticamente:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

### 2.5 Desplegar

1. Click en **"Deploy"**
2. Espera 1-3 minutos
3. ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

---

## 🔧 Paso 3: Verificar Deployment

### 3.1 Verificar Variables de Entorno

Ve a: **Settings → Environment Variables**

Debes tener:
- ✅ MONGODB_URL
- ✅ DATABASE_NAME
- ✅ JWT_SECRET
- ✅ JWT_ALGORITHM
- ✅ JWT_EXPIRATION
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET
- ✅ BLOB_READ_WRITE_TOKEN (conectado automáticamente)

### 3.2 Verificar Blob Storage

Ve a: **Storage → Blob → almacenamiento-cuentas-pagar**

Debe mostrar:
- Conectado al proyecto
- 0 B usado (inicialmente)

### 3.3 Probar la Aplicación

1. Abre: `https://tu-proyecto.vercel.app`
2. Debería mostrar la página principal
3. Ve a `/login` y crea un usuario
4. Sube una factura XML
5. Verifica que se guarde en Blob Storage

---

## 🔄 Paso 4: Desarrollo Continuo

### Para desarrollo local:

```powershell
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abre: http://localhost:3000
```

### Para actualizar producción:

```powershell
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin main

# Vercel despliega automáticamente
```

---

## 📊 Monitoreo y Logs

### Ver Deployments
https://vercel.com/dashboard/deployments

### Ver Logs en Tiempo Real
1. Selecciona tu proyecto
2. Click en **"Logs"** tab
3. Filtra por errores, warnings, etc.

### Ver Almacenamiento Blob
1. **Storage → Blob**
2. Navega por carpetas: `xml/`, `pdf/`, `exports/`
3. Descarga, elimina archivos si es necesario

---

## 🆘 Troubleshooting

### Error: "Failed to connect to MongoDB"
- Verifica que `MONGODB_URL` esté correcta en Vercel
- Verifica que MongoDB Atlas permita conexiones desde Vercel (0.0.0.0/0)

### Error: "Missing BLOB_READ_WRITE_TOKEN"
- Asegúrate de que Blob Storage esté conectado al proyecto
- Ve a Storage → Connect Store

### Error: "Invalid JWT"
- Verifica que `JWT_SECRET` sea de al menos 32 caracteres
- Asegúrate de que sea la misma en todas las instancias

### Archivos no se guardan
- En producción: Verifica que Blob esté conectado
- Verifica logs en Vercel Dashboard

---

## 📱 URLs Útiles

- **Tu Proyecto en Vercel:** https://vercel.com/dashboard/projects
- **GitHub Repo:** https://github.com/GabrielBlender/CUENTASPORPAGAR
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Vercel Blob Storage:** https://vercel.com/dashboard/stores

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Proyecto creado en Vercel desde GitHub
- [ ] Variables de entorno configuradas
- [ ] Blob Storage conectado
- [ ] Primer deployment exitoso
- [ ] Login funciona
- [ ] Upload de facturas funciona
- [ ] Archivos se guardan en Blob

---

## 🎉 ¡Felicidades!

Tu sistema de Cuentas por Pagar está desplegado en producción con:
- ✅ MongoDB Atlas (Base de datos)
- ✅ Vercel Blob (Almacenamiento de archivos)
- ✅ Vercel (Hosting y deployment automático)
- ✅ GitHub (Control de versiones)

Cualquier cambio que hagas y pushees a GitHub se desplegará automáticamente.
