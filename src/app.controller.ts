import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("test")
  @HttpCode(HttpStatus.OK)
   test(){
    // return "you do not have an account kindly register"
    return {message: 'You do not have an account kindly register'}
 
   }
}
