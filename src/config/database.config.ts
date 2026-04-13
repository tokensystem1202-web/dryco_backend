import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { washflowEntities } from '../database/entities';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const enableSsl =
    configService.get<string>('DB_SSL', databaseUrl ? 'true' : 'false') === 'true';
  const rejectUnauthorized =
    configService.get<string>('DB_REJECT_UNAUTHORIZED', 'false') === 'true';

  return {
    type: 'postgres',
    url: databaseUrl,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_NAME', 'washflow_db'),
    schema: configService.get<string>('DB_SCHEMA', 'public'),
    ssl: enableSsl ? { rejectUnauthorized } : false,
    entities: washflowEntities,
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};
