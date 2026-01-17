import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';

@injectable()
export class PrismaService {
    client: PrismaClient;

    constructor(@inject(TYPES.ILogger) private logger: ILogger) {
        this.client = new PrismaClient();
    }

    async connect(): Promise<void> {
        try {
            await this.client.$connect();
            this.logger.log('[Prisma Service] Connected to database');
        } catch(err) {
            if(err instanceof Error) {
                this.logger.error('[Prisma Service] Failed connection to database: ' + err.message);
            }
        }
     
    }

    async disconnect(): Promise<void> {
        await this.client.$disconnect();
    }
}