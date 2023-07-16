import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ) {}
  async signUp(dto: AuthDto) {
    //GENERATE PASSWORD
    const hash = await argon.hash(dto.password);

    //SAVE THE NEW USER IN DB
    const requestBody = {
      email: dto.email,
      hash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };

    try {
      const user =
        await this.prismaService.user.create({
          data: requestBody,
          // YOU CAN USE THIS TO AVOID RETURNING THE PASSWORD HASH
          ///*
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
          //*/
        });

      // OR YOU CAN DELET THE PASSWORD HASH FROM THE RESPONSE
      // delete user.hash;
      //RETURN THE SAVED USER
      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          //throw new ForbiddenException("Credentials taken")
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Email already used',
            },
            HttpStatus.FORBIDDEN,
            {
              cause: error,
            },
          );
        }
      }
      throw error;
    }
  }

  login() {
    return { message: 'Login' };
  }
}
