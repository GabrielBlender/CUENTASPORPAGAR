// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URL) {
  throw new Error('Please add MONGODB_URL to .env.local');
}

const uri = process.env.MONGODB_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una variable global para preservar la conexión
  // durante los hot-reloads de Next.js
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear una nueva conexión
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Obtiene la instancia de la base de datos
 * @returns Promise<Db> - Instancia de la base de datos MongoDB
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.DATABASE_NAME || 'cuentas_por_pagar');
}

/**
 * Verifica la conexión a MongoDB
 * @returns Promise<boolean> - true si la conexión es exitosa
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

export default clientPromise;
