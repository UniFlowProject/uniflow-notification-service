import { Notification } from '../entities/notification';
import { NotificationId } from '../value-objects/notification-id';
import { UserId } from '../value-objects/user-id';

export interface NotificationQueryOptions {
  limit?: number;
  offset?: number;
  isRead?: boolean;
}

export interface NotificationQueryResult {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: NotificationId): Promise<Notification | null>;
  findByUserId(
    userId: UserId,
    options?: NotificationQueryOptions,
  ): Promise<NotificationQueryResult>;
  getUnreadCount(userId: UserId): Promise<number>;
  delete(id: NotificationId): Promise<void>;
}
