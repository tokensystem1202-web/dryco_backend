import 'dotenv/config';
import { DataSource } from 'typeorm';
import { washflowEntities } from './entities';

const databaseUrl = process.env.DATABASE_URL;
const enableSsl = (process.env.DB_SSL ?? (databaseUrl ? 'true' : 'false')) === 'true';
const rejectUnauthorized = (process.env.DB_REJECT_UNAUTHORIZED ?? 'false') === 'true';
const isTsRuntime = __filename.endsWith('.ts');

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'washflow_db',
  schema: process.env.DB_SCHEMA ?? 'public',
  ssl: enableSsl ? { rejectUnauthorized } : false,
  entities: washflowEntities,
  migrations: [isTsRuntime ? 'src/database/migrations/*.ts' : 'dist/database/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
