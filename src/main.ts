// Load environment variables from .env file manually (no external dependency)
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = cleanValue;
        }
      }
    }
  });
  console.log('✅ Loaded .env file');
} catch (error) {
  console.log('⚠️ No .env file found, using system environment variables');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  console.log(`Starting server on port ${port}...`);
  console.log('Environment variables loaded:', {
    PORT: process.env.PORT || 'NOT SET (defaulting to 3000)',
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID ? 'SET' : 'NOT SET',
    GOOGLE_LOCATION: process.env.GOOGLE_LOCATION || 'NOT SET',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'SET (***hidden***)' : 'NOT SET',
  });
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Flutter and other client apps
  app.enableCors({
    origin: '*', // In production, specify your Flutter app's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(port);
  console.log(`✅ Server is running on http://localhost:${port}`);
}
bootstrap();
