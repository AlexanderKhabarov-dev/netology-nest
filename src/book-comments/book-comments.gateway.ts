import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateBookCommentDto } from './dto/create-book-comment.dto';
import { BookCommentsService } from './book-comments.service';
import { BookComment } from './entities/book-comment.entity';

@WebSocketGateway(80, { namespace: 'comments' })
export class BookCommentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bookCommentsService: BookCommentsService) {}

  @SubscribeMessage('subscribeToBook')
  async subscribeToBook(
    client: Socket,
    payload: { bookId: string },
  ): Promise<void> {
    await client.join(`book:${payload.bookId}`);
  }

  @SubscribeMessage('unsubscribeFromBook')
  async unsubscribeFromBook(
    client: Socket,
    payload: { bookId: string },
  ): Promise<void> {
    await client.leave(`book:${payload.bookId}`);
  }

  @SubscribeMessage('addComment')
  async addComment(
    _client: unknown,
    payload: CreateBookCommentDto,
  ): Promise<BookComment> {
    const comment = await this.bookCommentsService.addComment(payload);
    this.server.to(`book:${payload.bookId}`).emit('newComment', comment);
    return comment;
  }

  @SubscribeMessage('getAllComments')
  getAllComments(
    _client: unknown,
    payload: { bookId: string },
  ): Promise<BookComment[]> {
    return this.bookCommentsService.getAllComments(payload.bookId);
  }
}
