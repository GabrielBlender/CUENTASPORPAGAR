# ⚡ Inicio Rápido - Sistema de Cuentas por Pagar v2.0

Esta guía te ayudará a configurar y ejecutar el proyecto en tu máquina local en **menos de 10 minutos**.

## 🚀 Pasos Rápidos

### 1️⃣ Instalar Dependencias (2-3 minutos)

```powershell
cd "c:\Users\gfuentes\OneDrive - Union Group\Documentos\cuentas-por-pagar-v2"
npm install
```

### 2️⃣ Configurar MongoDB (5 minutos)

**Opción A - MongoDB Atlas (Recomendado para producción):**
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster gratuito (M0)
3. Crea un usuario de base de datos
4. Agrega `0.0.0.0/0` a la whitelist de IPs
5. Copia la connection string

**Opción B - MongoDB Local (Para desarrollo):**
```powershell
# Descargar e instalar MongoDB Community Edition
# https://www.mongodb.com/try/download/community
# Luego ejecutar:
mongod
```

Connection string local: `mongodb://localhost:27017/`

### 3️⃣ Configurar Variables de Entorno (1 minuto)

El archivo `.env.local` ya está creado. Solo necesitas actualizar:

```env
# Actualiza esta línea con tu connection string de MongoDB:
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/

# Las demás variables ya están configuradas para desarrollo
```

### 4️⃣ Ejecutar el Proyecto (30 segundos)

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎊

### 5️⃣ Crear Usuario Administrador (1 minuto)

**Opción A - Via API (Recomendado):**
```powershell
# Abrir nueva terminal PowerShell
$body = @{
    email = "admin@example.com"
    password = "admin123"
    nombre = "Administrador"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Opción B - Via MongoDB Compass:**
```javascript
// Conectar a tu MongoDB y ejecutar:
use cuentas_por_pagar

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIY.ey", // admin123
  nombre: "Administrador",
  role: "admin",
  activo: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

### 6️⃣ Iniciar Sesión ✅

1. Ve a [http://localhost:3000/login](http://localhost:3000/login)
2. Usuario: `admin@example.com`
3. Contraseña: `admin123`

---

## 📦 Estructura del Proyecto

```
cuentas-por-pagar-v2/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API Routes
│   ├── (auth)/             # Páginas de autenticación
│   └── (dashboard)/        # Páginas del dashboard
├── lib/                    # Lógica del backend
├── types/                  # Tipos TypeScript
├── styles/                 # Tema Material-UI
└── public/                 # Archivos estáticos
```

## 🔧 Scripts Disponibles

```powershell
npm run dev         # Servidor de desarrollo (localhost:3000)
npm run build       # Build de producción
npm start           # Servidor de producción
npm run lint        # Verificar código
```

## 🧪 Probar Funcionalidades

### 1. Crear una Empresa

```powershell
$body = @{
    nombre = "Empresa Demo S.A. de C.V."
    rfc = "EDE010101AAA"
    direccion = @{
        calle = "Av. Principal"
        numero = "123"
        colonia = "Centro"
        ciudad = "Ciudad de México"
        estado = "CDMX"
        cp = "01000"
    }
    contacto = @{
        nombre = "Juan Pérez"
        email = "contacto@empresademo.com"
        telefono = "5512345678"
    }
} | ConvertTo-Json -Depth 3

# Obtener el token de autenticación primero (después de login)
Invoke-RestMethod -Uri "http://localhost:3000/api/empresas" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body `
    -WebSession $session  # Usa la sesión del login
```

### 2. Subir una Factura XML

1. Ve a [http://localhost:3000/facturas/subir](http://localhost:3000/facturas/subir)
2. Selecciona una empresa
3. Arrastra un archivo XML (CFDI 4.0)
4. Opcionalmente, agrega el PDF
5. ¡Listo! La factura se procesará automáticamente

### 3. Ver Dashboard

Ve a [http://localhost:3000/dashboard](http://localhost:3000/dashboard) para ver:
- Total deuda pendiente
- Facturas pendientes
- Facturas pagadas este mes
- Próximos vencimientos

## 📚 Próximos Pasos

Una vez que tengas el proyecto funcionando localmente:

1. ✅ Revisa la [Documentación completa](README.md)
2. ✅ Lee la [Guía de Deployment](DEPLOYMENT.md) para subir a Emergent AI
3. ✅ Explora el código en `app/api/` para entender la estructura
4. ✅ Personaliza el tema en `styles/theme.ts`

## ❗ Problemas Comunes

### Error: "Cannot find module 'next'"
```powershell
npm install
```

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo
- Verifica la connection string en `.env.local`
- Asegúrate de que la IP esté en la whitelist (Atlas)

### Error: "Port 3000 already in use"
```powershell
# Cambiar puerto
$env:PORT=3001
npm run dev
```

### La página no carga
- Verifica que `npm run dev` esté corriendo
- Revisa la consola del navegador (F12) para errores
- Revisa la terminal donde corre el servidor

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs en la terminal
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que MongoDB esté corriendo y accesible
4. Lee el README.md completo

---

## ✅ Checklist de Configuración Inicial

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] MongoDB configurado (Atlas o local)
- [ ] `npm install` ejecutado exitosamente
- [ ] `.env.local` configurado con MongoDB URL
- [ ] `npm run dev` ejecutándose sin errores
- [ ] Usuario administrador creado
- [ ] Login funcional en http://localhost:3000
- [ ] Dashboard cargando correctamente

---

🎉 **¡Listo!** Ya puedes empezar a usar el sistema de Cuentas por Pagar v2.0

📧 Soporte: soporte@tuempresa.com
