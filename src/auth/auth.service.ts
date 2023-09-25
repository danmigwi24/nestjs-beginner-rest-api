import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  /**
   * REGISTER
   */
  async signUp(dto: RegisterDto) {
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

  /**
   * LOGIN WITHOUT JWT
   */
  async loginWithoutJwt(dto: LoginDto) {
    //FIND USER BY EMAIL
    const allUsers =
      await this.prismaService.user.findMany();
    //const filteredUsers = allUsers.filter({user => user.email == dto.email})
    console.log(allUsers);

    const user =
      await this.prismaService.user.findUnique({
        where: {
          // id: 1
          email: dto.email,
        },
      });
    //IF USER DOES NOT EXIST THROW EXCEPTION

    console.log(user);

    if (!user) {
      throw new HttpException(
        {
          status: 200, //HttpStatus.FORBIDDEN,
          error: 'Email already used',
        },
        //HttpStatus.FORBIDDEN,
        200,
        {
          cause: `Already email is used`,
        },
      );
    }

    //COMPARE HASH

    const passwordMatchCheck = await argon.verify(
      user.hash,
      dto.password,
    );

    if (!passwordMatchCheck) {
      throw new HttpException(
        {
          status: 200,
          error: 'Password Invalid',
        },
        200,
        {
          cause: 'Invalid Password',
        },
      );
    }

    delete user.hash;
    //SEND BACK USER DATA AND TOKEN
    return { status: 200, user: user };
  }

  /**
   * LOGIN WITH JWT
   */

  async login(dto: LoginDto) {
    //FIND USER BY EMAIL
    var user =
      await this.prismaService.user.findUnique({
        where: {
          //email: dto.email,
          id: 1,
        },
      });
    //IF USER DOES NOT EXIST THROW EXCEPTION

    if (!user) {
      throw new HttpException(
        {
          status: 200, //HttpStatus.FORBIDDEN,
          error: 'Email already used',
        },
        200,
        {
          cause: `Already email is used`,
        },
      );
    }

    //COMPARE HASH

    const passwordMatchCheck = await argon.verify(
      user.hash,
      dto.password,
    );

    if (!passwordMatchCheck) {
      throw new HttpException(
        {
          status: 200,
          error: 'Password Invalid',
        },
        200,
        {
          cause: 'Invalid Password',
        },
      );
    }

    delete user.hash;

    const jwTtoken = await this.signToken(
      user.id,
      user.email,
    );
    //const result: string = await this.convertPromiseToString(jwTtoken);
    console.log(`${jwTtoken}`);

    user['accesstoken'] = jwTtoken;

    //SEND BACK USER DATA AND TOKEN
    return {
      status: 200,
      user: user,
      token: jwTtoken,
    };
    //return this.signToken(user.id,user.email)
  }

  /**
   * GENERATE JWT
   */
  private async signToken(
    userId: number,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };

    const secret = this.configService.get(
      'JWT_SECRET_KEY',
    );

    const accessToken =
      await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: secret,
      });

    console.log(`${accessToken}`);

    return `${accessToken}`;
  }

  async convertPromiseToString(
    promise: Promise<string>,
  ): Promise<string> {
    const result: string = await promise;
    return result;
  }
}
