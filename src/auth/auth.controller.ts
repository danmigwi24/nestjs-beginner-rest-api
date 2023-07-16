import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto,LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  signUp(@Body() dto: RegisterDto) {
    console.log({
      dto,
    });

    return this.authService.signUp(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * METHOD DIFFER
   */

  @Post('signup2')
  @HttpCode(HttpStatus.OK)
  signUpWithoutDataClass(
    @Body('email') email: string,
    @Body('password', ParseIntPipe)
    password: string,
  ) {
    console.log({
      email,
      password,
      typeofEmail: typeof email,
    });

    return {
      email,
      password,
      typeofEmail: typeof email,
    };
  }
}
