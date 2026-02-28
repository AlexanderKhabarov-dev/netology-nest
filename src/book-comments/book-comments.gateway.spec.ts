import { Test, TestingModule } from '@nestjs/testing';
import { BookCommentsGateway } from './book-comments.gateway';

describe('BookCommentsGateway', () => {
  let gateway: BookCommentsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookCommentsGateway],
    }).compile();

    gateway = module.get<BookCommentsGateway>(BookCommentsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
