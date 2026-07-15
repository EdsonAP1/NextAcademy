import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar cookie parser para leer cookies httpOnly
  app.use(cookieParser());

  // Configuración de CORS estricto para cookies cruzadas
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend de NextAcademy iniciado en el puerto: ${port}`);
}
bootstrap();
