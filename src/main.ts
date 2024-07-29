import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/core/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService)
  app.useStaticAssets(join(__dirname, '..', 'public'));//js,css,images
  app.setBaseViewsDir(join(__dirname, '..', 'views'));//Hiển thị html views
  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true//Tất cả các thuộc tính khác sẽ bị loại bỏ
  }));


  const reflector = app.get(Reflector)
  //Auth
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  //interceptors
  app.useGlobalInterceptors(new TransformInterceptor(reflector))

  //config Cors
  app.enableCors({
    "origin": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,//Check CORS
    credentials: true
  });

  //hHelmet nó tự động thiết lập một số tiêu đề bảo mật mặc định
  app.use(helmet());


  //Config Cookies
  app.use(cookieParser());



  // //Config vesioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Default version should be a string, not an array
  });

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJs API Documentation')
    .setDescription('The NestJs API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>("PORT"));
}
bootstrap();
