# 🚀 Guía de Deployment en Emergent AI

Esta guía te ayudará a desplegar el sistema de Cuentas por Pagar v2.0 en Emergent AI desde GitHub.

## 📋 Pre-requisitos

1. ✅ Cuenta en [Emergent AI](https://www.emergent.ai/)
2. ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)
3. ✅ Repositorio en GitHub: https://github.com/venadit0/CUENTASPORPAGAR.git

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster (si no tienes uno)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un nuevo cluster (M0 Sandbox es gratuito)
3. Configura usuario y contraseña
4. Agrega tu IP a la whitelist (o usa `0.0.0.0/0` para permitir todas)

### 1.2 Obtener String de Conexión

1. En tu cluster, haz clic en "Connect"
2. Selecciona "Connect your application"
3. Copia la connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

### 1.3 Crear Base de Datos

Ejecuta en MongoDB Compass o en la web:

```javascript
use cuentas_por_pagar

// Crear colección de usuarios
db.createCollection("users")

// Crear índices
db.users.createIndex({ email: 1 }, { unique: true })
db.empresas.createIndex({ rfc: 1 }, { unique: true })
db.invoices.createIndex({ "cfdi.timbreFiscalDigital.uuid": 1 }, { unique: true })
db.invoices.createIndex({ empresa_id: 1 })
db.invoices.createIndex({ estado_pago: 1 })
```

### 1.4 Crear Usuario Administrador Inicial

Opción 1 - Vía MongoDB Compass:
```javascript
db.users.insertOne({
  email: "admin@tuempresa.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIY.ey", // admin123
  nombre: "Administrador",
  role: "admin",
  activo: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

Opción 2 - Vía API después del deploy (recomendado):
```bash
curl -X POST https://tu-app.emergent.ai/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tuempresa.com",
    "password": "admin123",
    "nombre": "Administrador",
    "role": "admin"
  }'
```

## 🔐 Paso 2: Generar Claves Secretas

### 2.1 JWT_SECRET

En PowerShell:
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) )
```

O en Node.js:
```javascript
require('crypto').randomBytes(32).toString('hex')
```

### 2.2 NEXTAUTH_SECRET

Igual que JWT_SECRET, genera otra clave diferente.

## 🚀 Paso 3: Deployment en Emergent AI

### 3.1 Conectar GitHub

1. Inicia sesión en [Emergent AI](https://www.emergent.ai/)
2. Ve a "New Deployment"
3. Selecciona "Import from GitHub"
4. Autoriza acceso a tu repositorio
5. Selecciona: `venadit0/CUENTASPORPAGAR`

### 3.2 Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```env
# MongoDB
MONGODB_URL=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/
DATABASE_NAME=cuentas_por_pagar

# JWT Authentication
JWT_SECRET=<tu-clave-generada-paso-2.1>
JWT_ALGORITHM=HS256
JWT_EXPIRATION=7d

# Next Auth
NEXTAUTH_URL=https://tu-app.emergent.ai
NEXTAUTH_SECRET=<tu-clave-generada-paso-2.2>

# Upload Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE_MB=10

# Environment
NODE_ENV=production
PORT=3000
```

### 3.3 Configurar Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Start Command:** `npm start`

### 3.4 Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build (3-5 minutos)
3. Una vez completado, obtendrás una URL como: `https://tu-app.emergent.ai`

## ✅ Paso 4: Verificar Deployment

### 4.1 Prueba la Aplicación

1. Abre la URL de tu aplicación
2. Deberías ver la pantalla de login
3. Usa las credenciales del usuario administrador que creaste

### 4.2 Prueba de Funcionalidades

- ✅ Login/Logout
- ✅ Crear empresa
- ✅ Subir factura XML
- ✅ Ver dashboard

### 4.3 Verificar Logs

En el dashboard de Emergent AI:
- Ve a "Deployments" > "Logs"
- Revisa que no haya errores
- Verifica conexión a MongoDB

## 🔧 Paso 5: Configuración Post-Deploy

### 5.1 Configurar Dominio Personalizado (Opcional)

1. En Emergent AI, ve a "Settings" > "Domains"
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

### 5.2 Habilitar HTTPS

Emergent AI habilita HTTPS automáticamente. Verifica que:
- La URL comience con `https://`
- El certificado sea válido

### 5.3 Configurar Backups de MongoDB

1. En MongoDB Atlas, ve a "Backup"
2. Habilita "Continuous Backup" (opcional, de pago)
3. Configura snapshots automáticos

## 🔄 Actualizaciones Futuras

### Actualización Automática

Emergent AI detecta automáticamente cambios en tu repositorio:

1. Haz `git push` a tu repositorio
2. Emergent AI iniciará un nuevo deploy automáticamente
3. Una vez completado, la nueva versión estará disponible

### Actualización Manual

Si prefieres control manual:

1. En Emergent AI, desactiva "Auto Deploy"
2. Cada vez que quieras actualizar, haz clic en "Redeploy"

## 📊 Monitoreo

### Métricas Importantes

Monitorea en el dashboard de Emergent AI:

- **CPU Usage:** Debería estar < 70%
- **Memory Usage:** Debería estar < 80%
- **Response Time:** Debería estar < 2s
- **Error Rate:** Debería estar < 1%

### Logs

Accede a los logs en tiempo real:
```bash
# En el dashboard de Emergent AI
Deployments > Tu App > Logs
```

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solución:**
1. Verifica que `MONGODB_URL` esté correcta
2. Asegúrate de que `0.0.0.0/0` esté en la whitelist de MongoDB Atlas
3. Verifica que el usuario/password sean correctos

### Error: "JWT secret not configured"

**Solución:**
1. Verifica que `JWT_SECRET` esté configurada en las variables de entorno
2. Debe tener al menos 32 caracteres
3. Redeploy después de agregar la variable

### Error: "Module not found"

**Solución:**
1. Verifica que `package.json` incluya todas las dependencias
2. Haz `npm install` localmente para verificar
3. Sube los cambios y redeploy

### La aplicación se reinicia constantemente

**Solución:**
1. Revisa los logs para identificar el error
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que MongoDB esté accesible

### Upload de archivos no funciona

**Solución:**
1. Verifica que el directorio `public/uploads` exista
2. En Emergent AI, los archivos subidos pueden no persistir entre deploys
3. Considera usar S3 o similar para archivos en producción

## 📚 Recursos Adicionales

- [Documentación de Emergent AI](https://docs.emergent.ai/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en Emergent AI
2. Verifica las variables de entorno
3. Contacta soporte: soporte@tuempresa.com

---

## 📝 Checklist de Deployment

- [ ] MongoDB Atlas configurado
- [ ] Base de datos y colecciones creadas
- [ ] Índices creados
- [ ] Usuario administrador creado
- [ ] Claves secretas generadas
- [ ] Variables de entorno configuradas en Emergent AI
- [ ] Repositorio conectado
- [ ] Build exitoso
- [ ] Aplicación accesible vía URL
- [ ] Login funciona correctamente
- [ ] Funcionalidades básicas probadas
- [ ] HTTPS habilitado
- [ ] Logs revisados

---

✅ **¡Deployment completado!** Tu sistema de Cuentas por Pagar v2.0 está en producción.
