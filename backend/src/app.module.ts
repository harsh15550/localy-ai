import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // .env ko load karega
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // PostgreSQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      Localization;

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {

        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<string>('DB_PORT'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log('DB_NAME:', configService.get<string>('DB_NAME'));

        return {
          type: 'postgres',

          host: configService.get<string>('DB_HOST'),

          port: Number(configService.get<string>('DB_PORT')),

          username: configService.get<string>('DB_USERNAME'),

          password: configService.get<string>('DB_PASSWORD'),

          database: configService.get<string>('DB_NAME'),

          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    UserModule,
  ],
})
export class AppModule { }