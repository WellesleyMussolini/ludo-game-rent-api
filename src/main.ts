import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://ludo-game-rent-api.onrender.com'],
  });
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
