// scripts/seed-admin.js
/**
 * Script para crear usuario administrador directamente en MongoDB
 * Ejecutar con: node scripts/seed-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuración directa
const MONGODB_URL = "mongodb+srv://Vercel-Admin-mongo-cuentas-pagar:717gvRIxqBfbux9Z@mongo-cuentas-pagar.6ew44i7.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "cuentas_por_pagar";

async function createAdminUser() {
  if (!MONGODB_URL) {
    console.error('❌ Error: MONGODB_URL no está definida en .env.local');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URL);

  try {
    console.log('🔄 Conectando a MongoDB...\n');
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('users');

    // Verificar si ya existe el usuario
    const existingUser = await usersCollection.findOne({ email: 'admin@test.com' });
    
    if (existingUser) {
      console.log('⚠️  El usuario admin@test.com ya existe\n');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
      console.log('\n🌐 Inicia sesión en: http://localhost:3000/login\n');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario administrador
    const adminUser = {
      email: 'admin@test.com',
      password: hashedPassword,
      nombre: 'Administrador',
      role: 'admin',
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await usersCollection.insertOne(adminUser);

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Nombre: Administrador');
    console.log('🛡️  Role: admin');
    console.log('🆔 ID:', result.insertedId.toString());
    console.log('\n🌐 Inicia sesión en: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdminUser();
