import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../common/base.controller';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { IUsersController } from './users.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { HttpError } from '../errors/http.error.class';
import { ValidateMiddleware } from '../common/validate.middleware';

@injectable()
export class UsersController extends BaseController implements IUsersController {
	constructor(
        @inject(TYPES.ILogger) private loggerService: ILogger,
        @inject(TYPES.UsersService) private usersService: UsersService
    ) {
		super(loggerService);
		this.bindRoutes([
			{ 
                path: '/register',
                method: 'post', 
                func: this.register, 
                middlewares: [new ValidateMiddleware(UserRegisterDto)] 
            },
			{ 
                path: '/login',
                method: 'post',
                func: this.login,
                middlewares: [new ValidateMiddleware(UserLoginDto)] 
             },
		]);
	}

	async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
        const result = await this.usersService.validateUser(body);
        if (!result) {
            return next(new HttpError(401, 'Error auth'));
        } else {
            this.ok(res, {});
        }
	}

	async register({ body }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
        const result = await this.usersService.createUser(body);
        if (!result) {
            return next(new HttpError(422, 'User already exists'));
        }
		this.ok(res, { email: result.email, id: result.id });
	}
}
