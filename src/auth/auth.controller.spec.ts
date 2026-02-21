import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService › login', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed.jwt.token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('signed.jwt.token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login должен вернуть объект с access_token', () => {
    const payload = { sub: 'userId', email: 'a@b.com', firstName: 'John' };

    const result = service.login(payload);

    expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ access_token: 'signed.jwt.token' });
  });
});
