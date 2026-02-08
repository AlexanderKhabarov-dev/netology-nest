import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  login(payload: JwtPayloadDto): { access_token: string } {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
