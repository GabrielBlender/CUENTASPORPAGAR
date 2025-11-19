# 🚀 Sistema de Cuentas por Pagar v2.0

Sistema completo de gestión de cuentas por pagar con soporte para CFDI 4.0 mexicano, construido con Next.js 14, Material-UI v5 y MongoDB.

## 📋 Características Principales

- ✅ **Parser CFDI 4.0** completo para facturas mexicanas (XML)
- ✅ **Autenticación JWT** segura con httpOnly cookies
- ✅ **Dashboard interactivo** con métricas en tiempo real
- ✅ **Gestión de empresas** con información completa
- ✅ **Gestión de facturas** con upload masivo de XML/PDF
- ✅ **Diseño responsive** Mobile-first con Material-UI
- ✅ **API RESTful** completa con Next.js API Routes
- ✅ **TypeScript** en todo el proyecto
- ✅ **Validación con Zod** en frontend y backend
- ✅ **MongoDB** como base de datos

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** Material-UI (MUI) v5
- **Estilos:** Emotion + Tailwind CSS
- **Formularios:** React Hook Form + Zod
- **State Management:** SWR para data fetching
- **TypeScript:** Tipado estricto

### Backend
- **API:** Next.js 14 API Routes
- **Base de Datos:** MongoDB
- **Autenticación:** JWT con jose library
- **Parser XML:** fast-xml-parser (CFDI 4.0)
- **Validación:** Zod
- **Archivos:** File System API

## 📁 Estructura del Proyecto

```
cuentas-por-pagar-v2/
├── app/
│   ├── api/                    # API Routes (Backend)
│   │   ├── auth/               # Autenticación
│   │   ├── empresas/           # CRUD Empresas
│   │   ├── invoices/           # CRUD Facturas
│   │   └── dashboard/          # Métricas
│   ├── (auth)/                 # Páginas de autenticación
│   │   └── login/
│   ├── (dashboard)/            # Páginas del dashboard
│   │   ├── dashboard/
│   │   ├── empresas/
│   │   └── facturas/
│   ├── layout.tsx              # Layout raíz
│   ├── page.tsx                # Página principal
│   └── globals.css             # Estilos globales
├── lib/                        # Utilidades y lógica del backend
│   ├── mongodb.ts              # Conexión a MongoDB
│   ├── auth.ts                 # Helpers de autenticación
│   ├── cfdi-parser.ts          # Parser CFDI 4.0
│   ├── validators.ts           # Validadores Zod
│   └── utils.ts                # Utilidades generales
├── types/                      # Tipos TypeScript
│   ├── index.ts                # Tipos generales
│   ├── cfdi.ts                 # Tipos CFDI 4.0
│   └── api.ts                  # Tipos de API
├── styles/
│   └── theme.ts                # Tema Material-UI
├── middleware.ts               # Middleware de autenticación
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/venadit0/CUENTASPORPAGAR.git
cd cuentas-por-pagar-v2
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y configura las variables:

```env
# MongoDB
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/
DATABASE_NAME=cuentas_por_pagar

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-min-32-caracteres
JWT_EXPIRATION=7d

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=otra-clave-secreta-super-segura-32-chars

# Uploads
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE_MB=10

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Crear usuario inicial (opcional)

Puedes crear un usuario administrador directamente en MongoDB o usar el endpoint `/api/auth/register`:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "nombre": "Administrador",
    "role": "admin"
  }'
```

### 5. Ejecutar en desarrollo

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Deployment en Emergent AI

### 1. Build de producción

```powershell
npm run build
```

### 2. Ejecutar en producción

```powershell
npm start
```

### 3. Variables de entorno en producción

Asegúrate de configurar todas las variables de entorno en Emergent AI:

- `MONGODB_URL`: URL de conexión a MongoDB Atlas
- `JWT_SECRET`: Clave secreta para JWT (mínimo 32 caracteres)
- `NEXTAUTH_SECRET`: Clave para NextAuth (mínimo 32 caracteres)
- `NODE_ENV=production`

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) con las siguientes características:

- **Almacenamiento:** httpOnly cookies (seguras)
- **Expiración:** 7 días por defecto
- **Middleware:** Protección automática de rutas
- **Roles:** `admin` y `user`

### Rutas protegidas:
- `/dashboard/*`
- `/empresas/*`
- `/facturas/*`
- `/api/*` (excepto `/api/auth/login` y `/api/auth/register`)

## 📄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Empresas
- `GET /api/empresas` - Listar empresas
- `POST /api/empresas` - Crear empresa
- `GET /api/empresas/[id]` - Obtener empresa
- `PUT /api/empresas/[id]` - Actualizar empresa
- `DELETE /api/empresas/[id]` - Eliminar empresa

### Facturas
- `GET /api/invoices` - Listar facturas
- `POST /api/invoices/upload` - Subir XML/PDF
- `GET /api/invoices/[id]` - Obtener factura
- `PUT /api/invoices/[id]` - Actualizar factura
- `DELETE /api/invoices/[id]` - Eliminar factura

## 📊 CFDI 4.0 Parser

El parser CFDI soporta:

✅ Lectura completa de XML CFDI 4.0
✅ Validación de estructura
✅ Extracción de datos del emisor
✅ Extracción de datos del receptor
✅ Conceptos con impuestos
✅ Impuestos trasladados y retenidos
✅ Timbre Fiscal Digital (UUID)
✅ Validación de RFC
✅ Validación de totales

### Ejemplo de uso:

```typescript
import { cfdiParser } from '@/lib/cfdi-parser';

// Parsear XML
const cfdiData = cfdiParser.parseXML(xmlContent);

// Validar
const validation = cfdiParser.validateCFDI(xmlContent);
if (!validation.valid) {
  console.error(validation.errors);
}
```

## 🎨 Personalización del Tema

Edita `styles/theme.ts` para cambiar colores y estilos:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul principal
    },
    secondary: {
      main: '#9c27b0', // Púrpura
    },
  },
});
```

## 🧪 Testing (Próximamente)

```powershell
npm test
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Servidor de producción
- `npm run lint` - Linter ESLint
- `npm run type-check` - Verificar tipos TypeScript

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verifica que la URL de MongoDB esté correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica las credenciales de usuario

### Errores de TypeScript
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Ejecuta `npm run type-check` para ver todos los errores

### Errores en el upload de archivos
- Verifica que el directorio `public/uploads` exista
- Verifica los permisos del directorio
- Revisa el tamaño máximo de archivo en `.env.local`

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [SAT - CFDI 4.0](http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/Anexo_20_Guia_de_llenado_CFDI.pdf)

## 👥 Contribuciones

Este es un proyecto privado. Para contribuir, contacta al administrador del repositorio.

## 📄 Licencia

Privado - Uso interno exclusivo

## 🆘 Soporte

Para soporte técnico, contacta a: soporte@example.com

---

**v2.0** - Desarrollado con ❤️ usando Next.js 14 y Material-UI
