# 🚀 Sistema de Cuentas por Pagar v2.0

![Version](https://img.shields.io/badge/version-2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Material--UI](https://img.shields.io/badge/Material--UI-5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

**Sistema completo de gestión de cuentas por pagar con soporte CFDI 4.0 mexicano**

---

## 🎯 Características Principales

- ✅ **Parser CFDI 4.0** completo para facturas electrónicas mexicanas
- ✅ **Autenticación JWT** segura con cookies httpOnly
- ✅ **Dashboard Interactivo** con métricas en tiempo real
- ✅ **Gestión de Empresas** con información fiscal completa
- ✅ **Upload masivo** de archivos XML y PDF
- ✅ **Responsive Design** Mobile-first con Material-UI
- ✅ **API RESTful** completa con Next.js 14
- ✅ **TypeScript** en todo el proyecto

---

## 📚 Documentación

### 🚀 Inicio Rápido
- **[QUICKSTART.md](QUICKSTART.md)** - Configura el proyecto en 10 minutos
- **[README.md](README.md)** - Documentación completa del proyecto
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de deployment en Emergent AI
- **[RESUMEN.md](RESUMEN.md)** - Resumen ejecutivo del proyecto

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router, Server Components)
- **UI Library:** Material-UI (MUI) v5
- **Estilos:** Emotion + Tailwind CSS
- **Formularios:** React Hook Form + Zod
- **State:** SWR para data fetching
- **Language:** TypeScript

### Backend
- **API:** Next.js 14 API Routes
- **Database:** MongoDB (Atlas)
- **Auth:** JWT con jose library + bcryptjs
- **Parser:** fast-xml-parser (CFDI 4.0)
- **Validation:** Zod

---

## 📦 Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/venadit0/CUENTASPORPAGAR.git
cd CUENTASPORPAGAR

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de MongoDB

# 4. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗂️ Estructura del Proyecto

```
cuentas-por-pagar-v2/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── auth/               # Autenticación (login, logout, register)
│   │   ├── empresas/           # CRUD Empresas
│   │   └── invoices/           # CRUD Facturas + Upload
│   ├── (auth)/                 # Páginas de autenticación
│   └── (dashboard)/            # Dashboard protegido
├── lib/                        # Lógica del backend
│   ├── mongodb.ts              # Conexión MongoDB
│   ├── auth.ts                 # JWT helpers
│   ├── cfdi-parser.ts          # Parser CFDI 4.0
│   ├── validators.ts           # Validadores Zod
│   └── utils.ts                # Utilidades
├── types/                      # TypeScript types
├── styles/                     # Tema Material-UI
└── middleware.ts               # Auth middleware
```

---

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) almacenados en httpOnly cookies:

```typescript
// Login
POST /api/auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}

// Register
POST /api/auth/register
{
  "email": "nuevo@example.com",
  "password": "password123",
  "nombre": "Nombre Usuario",
  "role": "admin" // o "user"
}
```

---

## 📄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Empresas
- `GET /api/empresas` - Listar todas
- `POST /api/empresas` - Crear nueva
- `GET /api/empresas/[id]` - Obtener una
- `PUT /api/empresas/[id]` - Actualizar
- `DELETE /api/empresas/[id]` - Eliminar

### Facturas
- `POST /api/invoices/upload` - Subir XML/PDF
- `GET /api/invoices` - Listar facturas
- `GET /api/invoices/[id]` - Obtener factura
- `PUT /api/invoices/[id]` - Actualizar
- `DELETE /api/invoices/[id]` - Eliminar

---

## 📊 Parser CFDI 4.0

El parser extrae automáticamente toda la información de facturas electrónicas mexicanas:

```typescript
import { cfdiParser } from '@/lib/cfdi-parser';

// Parsear XML
const cfdiData = cfdiParser.parseXML(xmlContent);

// Validar estructura
const validation = cfdiParser.validateCFDI(xmlContent);
if (!validation.valid) {
  console.error(validation.errors);
}

// Datos extraídos:
// - Emisor (Proveedor): RFC, Nombre, Régimen Fiscal
// - Receptor (Empresa): RFC, Nombre, Uso CFDI
// - Conceptos: Descripción, Cantidad, Precio, Impuestos
// - Impuestos: IVA, Retenciones
// - Timbre Fiscal: UUID, Fecha de Timbrado
// - Totales: Subtotal, Descuentos, Total
```

---

## 🎨 Personalización

### Cambiar colores del tema

Edita `styles/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Tu color principal
    },
    secondary: {
      main: '#9c27b0', // Tu color secundario
    },
  },
});
```

---

## 🚀 Deployment

### Emergent AI (Recomendado)

Sigue la guía completa en [DEPLOYMENT.md](DEPLOYMENT.md):

1. Configurar MongoDB Atlas (gratis)
2. Generar claves JWT secretas
3. Conectar GitHub con Emergent AI
4. Configurar variables de entorno
5. Deploy automático ✨

### Vercel / Netlify

```bash
npm run build
npm start
```

---

## 🧪 Scripts

```bash
npm run dev         # Desarrollo (localhost:3000)
npm run build       # Build de producción
npm start           # Servidor de producción
npm run lint        # Verificar código
npm run type-check  # Verificar tipos TypeScript
```

---

## 📝 Variables de Entorno

```env
# MongoDB
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=cuentas_por_pagar

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-32-chars
JWT_EXPIRATION=7d

# Next.js
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=otra-clave-secreta-32-chars

# Configuración
NODE_ENV=production
PORT=3000
```

---

## 🐛 Troubleshooting

### No puedo conectar a MongoDB
- Verifica que la URL esté correcta en `.env.local`
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica usuario y contraseña

### Error: Module not found
```bash
npm install
```

### Puerto 3000 en uso
```bash
$env:PORT=3001
npm run dev
```

Ver más en [README.md](README.md)

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Material-UI Docs](https://mui.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [SAT - CFDI 4.0](http://omawww.sat.gob.mx/)

---

## 🤝 Contribuciones

Este es un proyecto privado de uso interno. Para contribuir, contacta al administrador.

---

## 📄 Licencia

Privado - © 2025 - Uso interno exclusivo

---

## 👥 Autor

**GitHub:** [@venadit0](https://github.com/venadit0)  
**Repositorio:** [CUENTASPORPAGAR](https://github.com/venadit0/CUENTASPORPAGAR)

---

## 🌟 Features Próximas

- [ ] Dashboard con gráficos (Recharts)
- [ ] Tabla de facturas con filtros avanzados
- [ ] Exportación a Excel/PDF
- [ ] Sistema de notificaciones en tiempo real
- [ ] Dark Mode
- [ ] Tests automatizados
- [ ] Multi-tenancy

---

**Versión:** 2.0  
**Última actualización:** 13 de Noviembre, 2025  
**Stack:** Next.js 14 + Material-UI v5 + MongoDB + TypeScript

---

⭐ **¡Dale una estrella si te fue útil!**
