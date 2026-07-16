import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/repositories/notification-repository.interface';
import { NotificationId } from '../../domain/value-objects/notification-id';
import type { DeleteNotificationCommand } from '../commands/delete-notification.command';

@Injectable()
export class DeleteNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(command: DeleteNotificationCommand): Promise<void> {
    const notificationId = new NotificationId(command.notificationId);

    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.delete(notificationId);
  }
}
