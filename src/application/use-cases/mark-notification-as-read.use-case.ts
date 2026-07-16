import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/repositories/notification-repository.interface';
import { NotificationDomainService } from '../../domain/services/notification-domain.service';
import { NotificationId } from '../../domain/value-objects/notification-id';
import type { MarkNotificationAsReadCommand, MarkNotificationAsReadResult } from '../commands/mark-as-read.command';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationDomainService: NotificationDomainService,
  ) {}

  async execute(
    command: MarkNotificationAsReadCommand,
  ): Promise<MarkNotificationAsReadResult> {
    const notificationId = new NotificationId(command.notificationId);

    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!this.notificationDomainService.canMarkAsRead(notification)) {
      throw new Error('Notification is already marked as read');
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);

    return {
      id: notification.getId().getValue(),
      isRead: true,
      markedAt: notification.getReadAt()!,
      success: true,
    };
  }
}
