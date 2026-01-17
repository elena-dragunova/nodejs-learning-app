import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { ILogger } from '../logger/logger.interface';
import { IConfigService } from './config.service.interface';
import { TYPES } from '../types';

@injectable()
export class ConfigService implements IConfigService {
    private config: DotenvParseOutput;

    constructor(@inject(TYPES.ILogger) private logger: ILogger) {
        const result: DotenvConfigOutput = config();
        if (result.error) {
            this.logger.error('[ConfigService] Failed reading .env file');
        } else {
            this.config = result.parsed as DotenvParseOutput;
        }
    }

    get(key: string): string {
        return this.config[key] as string;
    }
}