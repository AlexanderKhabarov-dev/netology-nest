import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { compare, hash } from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authService: AuthService,
  ) {}

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const userDoc = await this.userModel.findOne({ email }).lean().exec();
    if (!userDoc) return null;

    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      firstName: userDoc.firstName,
      createdAt: userDoc.createdAt,
      password: userDoc.password,
    };
  }

  async signup(signupUserDto: SigninUserDto): Promise<User> {
    const hashedPassword = await hash(signupUserDto.password, 10);

    const userData = {
      ...signupUserDto,
      password: hashedPassword,
    };

    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async signin(
    signinUserDto: SigninUserDto,
  ): Promise<{ access_token: string }> {
    const userDoc = await this.userModel
      .findOne({ email: signinUserDto.email })
      .exec();
    if (!userDoc) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(
      signinUserDto.password,
      userDoc.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: userDoc._id.toString(),
      email: userDoc.email,
      firstName: userDoc.firstName,
    };

    const access_token = this.authService.login(payload);

    return access_token;
  }
}
