import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// require('dotenv').config()

@Injectable()
export class PrismaService extends PrismaClient{
 constructor(config: ConfigService){
    super({
        datasources: {
            db: {
                //url: process.env.DATABASE_URL
                //url: 'postgresql://postgres:123@localhost:5431/nestjs_rest_api?schema=public'
                url: config.get('DATABASE_URL')
            }
        }
    });
 }
}
