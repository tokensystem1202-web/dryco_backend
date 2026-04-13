import { AuthenticatedUser } from '../auth/auth.types';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(user: AuthenticatedUser, dto: CreateServiceDto): Promise<import("../database/entities").ServiceEntity>;
    findByBusiness(businessId: string): Promise<import("../database/entities").ServiceEntity[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateServiceDto): Promise<import("../database/entities").ServiceEntity>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        removed: boolean;
    }>;
}
