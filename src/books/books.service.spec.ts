import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

type MockModel = jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('BooksService (сервис книг)', () => {
  let service: BooksService;
  let mockBookModel: MockModel;

  const mockBook = {
    _id: 'mockId123',
    title: 'Clean Code',
    author: 'R. Martin',
    pages: 200,
  };

  beforeEach(async () => {
    mockBookModel = Object.assign(
      jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockBook),
      })),
      {
        find: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockBook]) }),
        findById: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) }),
        findByIdAndUpdate: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) }),
        findByIdAndDelete: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBook) }),
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('create (создание)', () => {
    it('должен создать экземпляр с dto, вызвать save() и вернуть книгу', async () => {
      const dto = { title: 'Clean Code', author: 'R. Martin', pages: 200 };
      const saveMock = jest.fn().mockResolvedValue(mockBook);
      mockBookModel.mockImplementationOnce(() => ({ save: saveMock }));

      const result = await service.create(dto);

      expect(mockBookModel).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });
  });

  describe('findAll (список всех)', () => {
    it('должен вызвать find() без фильтров и вернуть массив книг', async () => {
      const result = await service.findAll();

      expect(mockBookModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([mockBook]);
    });
  });

  describe('findOne (поиск по id)', () => {
    it('должен вернуть книгу по id', async () => {
      const result = await service.findOne('mockId123');

      expect(mockBookModel.findById).toHaveBeenCalledWith('mockId123');
      expect(result).toEqual(mockBook);
    });

    it('должен выбросить NotFoundException, если книга не найдена', async () => {
      mockBookModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('badId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update (обновление)', () => {
    it('должен обновить и вернуть обновлённую книгу', async () => {
      const dto = { title: 'Updated Title' };
      const updatedBook = { ...mockBook, ...dto };

      mockBookModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBook),
      });

      const result = await service.update('mockId123', dto);

      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockId123',
        dto,
        { new: true },
      );
      expect(result).toEqual(updatedBook);
    });

    it('должен выбросить NotFoundException, если обновляемая книга не найдена', async () => {
      mockBookModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('badId', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove (удаление)', () => {
    it('должен удалить книгу и вернуть сообщение об успехе', async () => {
      const result: unknown = await service.remove('mockId123');

      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledWith('mockId123');
      expect(result).toEqual({
        message: 'Book successfully deleted',
        id: 'mockId123',
      });
    });

    it('должен выбросить NotFoundException, если удаляемая книга не найдена', async () => {
      mockBookModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('badId')).rejects.toThrow(NotFoundException);
    });
  });
});
