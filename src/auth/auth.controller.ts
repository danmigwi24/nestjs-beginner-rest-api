import { Body, Controller, Get, HttpCode, HttpStatus, ParseIntPipe, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Get("test")
 @HttpCode(HttpStatus.OK)
  test(){
   // return "you do not have an account kindly register"
   return {message: 'You do not have an account kindly register'}

  }

  @Post("signup2")
 @HttpCode(HttpStatus.OK)
  signUpWithoutDataClass(
     @Body("email") email:string,
    @Body('password',ParseIntPipe) password:string
  )
   {
  console.log({
    email,
    password,
    typeofEmail:typeof email
   });
  
    return {
      email,
      password,
      typeofEmail:typeof email
     }
  }

  @Post("signup")
 @HttpCode(HttpStatus.OK)
  signUp(
    @Body() dto:AuthDto,
  )
   {
  console.log({
    dto
   });
  
    return this.authService.signUp(dto);
  }
  

@Post("login")
@HttpCode(200)
  login(){
    return this.authService.login();
  }

  
}
