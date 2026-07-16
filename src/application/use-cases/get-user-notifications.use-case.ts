import { Injectable, Inject } from '@nestjs/common';
import type {
  INotificationRepository,
  NotificationQueryResult,
} from '../../domain/repositories/notification-repository.interface';
import { UserId } from '../../domain/value-objects/user-id';
import type { GetUserNotificationsQuery } from '../queries/get-user-notifications.query';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    query: GetUserNotificationsQuery,
  ): Promise<NotificationQueryResult> {
    const userId = new UserId(query.userId);

    return this.notificationRepository.findByUserId(userId, {
      limit: query.limit,
      offset: query.offset,
      isRead: query.isRead,
    });
  }
}
