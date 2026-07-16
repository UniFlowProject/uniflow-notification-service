import { Notification } from '../../domain/entities/notification';
import type { NotificationRecipient } from '../dto/notification-recipient';

export interface NotificationSenderPort {
  sendPushNotification(
    recipient: NotificationRecipient,
    notification: Notification,
  ): Promise<boolean>;
  sendEmailNotification(
    recipient: NotificationRecipient,
    notification: Notification,
  ): Promise<boolean>;
}
