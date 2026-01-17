import express, { Express } from 'express';
import { Server } from 'http';
import { injectable, inject } from 'inversify';
import { UsersController } from './users/users.controller';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { json } from 'body-parser';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { PrismaService } from './database/prisma.service';
import { AuthMiddleware } from './common/auth.middleware';
import { IConfigService } from './config/config.service.interface';

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.UsersController) private usersController: UsersController,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
        @inject(TYPES.PrismaService) private prismaService: PrismaService,
        @inject(TYPES.ConfigService) private configService: IConfigService
	) {
		this.app = express();
		this.port = 8080;
	}

    useMiddleware(): void {
        this.app.use(json());
        const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
        this.app.use(authMiddleware.execute.bind(authMiddleware));
    }

	useRoutes() {
		this.app.use('/users', this.usersController.router);
	}

	useExceptionFilters() {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init() {
        this.useMiddleware();
		this.useRoutes();
		this.useExceptionFilters();
        await this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`Server is running at http://localhost:${this.port}`);
	}
}
