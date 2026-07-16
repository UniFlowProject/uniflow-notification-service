import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/repositories/notification-repository.interface';
import { UserId } from '../../domain/value-objects/user-id';
import type { GetUnreadCountQuery, GetUnreadCountResult } from '../queries/get-unread-count.query';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetUnreadCountQuery): Promise<GetUnreadCountResult> {
    const userId = new UserId(query.userId);
    const unreadCount =
      await this.notificationRepository.getUnreadCount(userId);

    return {
      userId: query.userId,
      unreadCount,
      lastChecked: new Date(),
    };
  }
}
