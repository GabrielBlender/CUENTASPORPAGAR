// scripts/create-admin-user.js
/**
 * Script para crear usuario administrador
 * Ejecutar con: node scripts/create-admin-user.js
 */

const http = require('http');

const userData = {
  email: 'admin@test.com',
  password: 'admin123',
  nombre: 'Administrador',
  role: 'admin'
};

const data = JSON.stringify(userData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Creando usuario administrador...\n');

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      
      if (res.statusCode === 201) {
        console.log('✅ Usuario creado exitosamente!\n');
        console.log('📧 Email:', userData.email);
        console.log('🔑 Password:', userData.password);
        console.log('👤 Nombre:', userData.nombre);
        console.log('🛡️  Role:', userData.role);
        console.log('\n🌐 Inicia sesión en: http://localhost:3000/login\n');
      } else if (res.statusCode === 409) {
        console.log('⚠️  El usuario ya existe\n');
        console.log('📧 Email:', userData.email);
        console.log('🔑 Password:', userData.password);
        console.log('\n🌐 Inicia sesión en: http://localhost:3000/login\n');
      } else {
        console.log('❌ Error:', response);
      }
    } catch (error) {
      console.log('❌ Error al parsear respuesta:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  console.log('\n⚠️  Asegúrate de que el servidor esté corriendo:');
  console.log('   npm run dev\n');
});

req.write(data);
req.end();
