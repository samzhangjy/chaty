import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get('DATABASE_HOST'),
      port: this.config.get('DATABASE_PORT'),
      database: this.config.get('DATABASE_NAME'),
      username: this.config.get('DATABASE_USER'),
      password: this.config.get('DATABASE_PASSWORD'),
      entities: ['dist/**/*.entity.{ts,js}'],
      migrations: ['migrations/*.{ts,js}'],
      migrationsTableName: 'typeorm_migrations',
      synchronize: this.config.get('IS_DEVELOPMENT') ?? false,
    };
  }
}
