"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = void 0;
const entities_1 = require("../database/entities");
const getTypeOrmConfig = (configService) => {
    const databaseUrl = configService.get('DATABASE_URL');
    const enableSsl = configService.get('DB_SSL', databaseUrl ? 'true' : 'false') === 'true';
    const rejectUnauthorized = configService.get('DB_REJECT_UNAUTHORIZED', 'false') === 'true';
    return {
        type: 'postgres',
        url: databaseUrl,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'washflow_db'),
        schema: configService.get('DB_SCHEMA', 'public'),
        ssl: enableSsl ? { rejectUnauthorized } : false,
        entities: entities_1.washflowEntities,
        migrations: ['dist/database/migrations/*.js'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
    };
};
exports.getTypeOrmConfig = getTypeOrmConfig;
//# sourceMappingURL=database.config.js.map