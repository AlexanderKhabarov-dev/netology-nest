import { Test, TestingModule } from '@nestjs/testing';
import { BookCommentsService } from './book-comments.service';

describe('BookCommentsService', () => {
  let service: BookCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookCommentsService],
    }).compile();

    service = module.get<BookCommentsService>(BookCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
