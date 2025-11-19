// lib/blob-storage.ts
import { put, del, list } from '@vercel/blob';

/**
 * Configuración de Vercel Blob Storage
 * En desarrollo usa file system local si no hay token
 * En producción usa Vercel Blob
 */
const USE_VERCEL_BLOB = process.env.BLOB_READ_WRITE_TOKEN !== undefined;

/**
 * Sube un archivo a Vercel Blob o al file system local
 * @param file - Archivo a subir
 * @param folder - Carpeta destino (xml, pdf, exports)
 * @returns URL pública del archivo
 */
export async function uploadFile(
  file: File,
  folder: 'xml' | 'pdf' | 'exports'
): Promise<string> {
  if (USE_VERCEL_BLOB) {
    // Usar Vercel Blob en producción
    const filename = `${folder}/${Date.now()}_${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  } else {
    // Usar file system local en desarrollo
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    const { randomUUID } = await import('crypto');

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}_${randomUUID()}_${file.name}`;
    const filepath = join(uploadDir, filename);
    const buffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));

    return `/uploads/${folder}/${filename}`;
  }
}

/**
 * Sube un buffer directamente (útil para archivos generados)
 * @param buffer - Buffer del archivo
 * @param filename - Nombre del archivo
 * @param folder - Carpeta destino
 * @returns URL pública del archivo
 */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  folder: 'xml' | 'pdf' | 'exports'
): Promise<string> {
  if (USE_VERCEL_BLOB) {
    const blob = await put(`${folder}/${Date.now()}_${filename}`, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  } else {
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, `${Date.now()}_${filename}`);
    await writeFile(filepath, buffer);

    return `/uploads/${folder}/${filename}`;
  }
}

/**
 * Elimina un archivo de Vercel Blob o del file system local
 * @param url - URL del archivo a eliminar
 */
export async function deleteFile(url: string): Promise<void> {
  if (USE_VERCEL_BLOB && url.includes('vercel-storage.com')) {
    // Eliminar de Vercel Blob
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } else if (url.startsWith('/uploads/')) {
    // Eliminar de file system local
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const filepath = join(process.cwd(), 'public', url);
    
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

/**
 * Lista archivos de una carpeta (solo para Vercel Blob)
 * @param folder - Carpeta a listar
 */
export async function listFiles(folder: 'xml' | 'pdf' | 'exports') {
  if (USE_VERCEL_BLOB) {
    const { blobs } = await list({
      prefix: folder,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blobs;
  }
  return [];
}

/**
 * Obtiene la URL pública de un archivo
 * Ya sea de Vercel Blob o del file system local
 * @param url - URL almacenada en la base de datos
 */
export function getPublicUrl(url: string): string {
  // Si ya es una URL completa de Vercel Blob, retornarla
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si es una ruta local, construir URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}${url}`;
}
