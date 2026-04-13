"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./auth/auth.service");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new validation_pipe_1.AppValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsPath)) {
        (0, fs_1.mkdirSync)(uploadsPath, { recursive: true });
    }
    app.use('/uploads', express_1.default.static(uploadsPath));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('WashFlow API')
        .setDescription('Laundry and Dry Cleaning SaaS platform API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument);
    const port = Number(process.env.PORT ?? 3000);
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (adminEmail && adminPassword) {
        const authService = app.get(auth_service_1.AuthService);
        const result = await authService.ensureAdminAccount(adminEmail, adminPassword, process.env.ADMIN_NAME?.trim() || 'DryCo Admin');
        logger.log(result.created
            ? `Bootstrap admin created for ${result.email}`
            : result.updated
                ? `Bootstrap admin refreshed for ${result.email}`
                : `Bootstrap admin already ready for ${result.email}`);
    }
    await app.listen(port);
    logger.log(`WashFlow backend running on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map