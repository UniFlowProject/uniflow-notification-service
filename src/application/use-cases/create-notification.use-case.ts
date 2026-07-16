import { Injectable, Inject } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification';
import { NotificationDomainService } from '../../domain/services/notification-domain.service';
import type { INotificationRepository } from '../../domain/repositories/notification-repository.interface';
import type { NotificationSenderPort } from '../ports/notification-sender.port';
import type { NotificationBroadcasterPort } from '../ports/notification-broadcaster.port';
import { UserId } from '../../domain/value-objects/user-id';
import { NotificationType } from '../../domain/value-objects/notification-type';
import { Priority } from '../../domain/value-objects/priority';
import { User } from 'src/domain/entities/user';
import { Email } from 'src/domain/value-objects/email';

export interface CreateNotificationCommand {
  userId: string;
  name: string;
  email: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  taskId?: string;
  subjectId?: string;
  actionUrl?: string;
  scheduledFor?: string;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationDomainService: NotificationDomainService,
    @Inject('NotificationSenderPort')
    private readonly notificationSender: NotificationSenderPort,
    @Inject('NotificationBroadcasterPort')
    private readonly notificationBroadcaster: NotificationBroadcasterPort,
  ) { }

  async execute(command: CreateNotificationCommand): Promise<Notification> {
    const userId = new UserId(command.userId);
    const type = NotificationType.fromString(command.type);
    const priority = Priority.fromString(command.priority);

    const scheduledFor = command.scheduledFor
      ? new Date(command.scheduledFor)
      : undefined;

    if (scheduledFor) {
      this.notificationDomainService.validateScheduledTime(scheduledFor);
    }

    const notification = this.notificationDomainService.createNotification({
      userId,
      title: command.title,
      message: command.message,
      type,
      priority,
      taskId: command.taskId,
      subjectId: command.subjectId,
      actionUrl: command.actionUrl,
      scheduledFor,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    if (
      this.notificationDomainService.shouldSendImmediately(savedNotification)
    ) {
      await Promise.all([
        this.sendNotification(savedNotification, command.name, command.email),
        this.broadcastNotification(savedNotification),
      ]);
    }

    return savedNotification;
  }

  private async broadcastNotification(
    notification: Notification,
  ): Promise<void> {
    try {
      await this.notificationBroadcaster.broadcastToUser(
        notification.getUserId().getValue(),
        notification,
      );
    } catch (error) {
      console.error('Failed to broadcast notification via WebSocket:', error);
    }
  }

  private async sendNotification(notification: Notification, name: string, email: string): Promise<void> {
    try {
      const user = User.create({
        id: notification.getUserId(),
        name: name,
        email: new Email(email),
        deviceTokens: [],
      })

      const [pushSent, emailSent] = await Promise.allSettled([
        this.notificationSender.sendPushNotification(user, notification),
        this.notificationSender.sendEmailNotification(user, notification),
      ]);

      if (pushSent.status === 'rejected') {
        console.error('Failed to send push notification:', pushSent.reason);
      }

      if (emailSent.status === 'rejected') {
        console.error('Failed to send email notification:', emailSent.reason);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}
