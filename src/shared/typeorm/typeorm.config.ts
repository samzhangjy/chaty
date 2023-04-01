import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `src/common/envs/${
      process.env.NODE_ENV === 'development' ? 'development' : ''
    }.env`,
  ),
});

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: ['dist/migrations/*.{ts,js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: !!process.env.IS_DEVELOPMENT ?? false,
};

export default new DataSource(typeormConfig);
