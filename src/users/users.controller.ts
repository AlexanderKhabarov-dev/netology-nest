import { Post, Body, HttpCode, HttpStatus, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SigninUserDto } from './dto/signin-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupUserDto: SignupUserDto): Promise<UserResponseDto> {
    return this.usersService.signup(signupUserDto);
  }

  @Post('signin')
  async signin(
    @Body() signinUserDto: SigninUserDto,
  ): Promise<{ access_token: string }> {
    return this.usersService.signin(signinUserDto);
  }
}
