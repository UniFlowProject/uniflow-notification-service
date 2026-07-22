import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  INotificationRepository,
  NotificationQueryOptions,
  NotificationQueryResult,
} from '../../domain/repositories/notification-repository.interface';
import { Notification } from '../../domain/entities/notification';
import { NotificationId } from '../../domain/value-objects/notification-id';
import { UserId } from '../../domain/value-objects/user-id';
import {
  NotificationDocument,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NotificationSchema.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) { }

  async save(notification: Notification): Promise<Notification> {
    const props = notification.toProps();

    // Try to update existing document first
    const existingDoc = await this.notificationModel
      .findByIdAndUpdate(
        props.id.getValue(),
        NotificationMapper.toMongoUpdate(notification),
        { new: true, runValidators: true },
      )
      .exec();

    if (existingDoc) {
      return NotificationMapper.toDomain(existingDoc);
    }

    // If not found, create new document
    const mongoData = NotificationMapper.toMongo(notification);
    const newDoc = new this.notificationModel(mongoData);
    const savedDoc = await newDoc.save();

    return NotificationMapper.toDomain(savedDoc);
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    const document = await this.notificationModel
      .findById(id.getValue())
      .exec();

    return document ? NotificationMapper.toDomain(document) : null;
  }

  async findByUserId(
    userId: UserId,
    options: NotificationQueryOptions = {},
  ): Promise<NotificationQueryResult> {
    const { limit = 20, offset = 0, isRead } = options;

    const filter: Record<string, any> = { userId: userId.getValue() };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    const [documents, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
    ]);

    const notifications = documents.map((doc) =>
      NotificationMapper.toDomain(doc),
    );

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getUnreadCount(userId: UserId): Promise<number> {
    return this.notificationModel
      .countDocuments({
        userId: userId.getValue(),
        isRead: false,
      })
      .exec();
  }

  async delete(id: NotificationId): Promise<void> {
    const result = await this.notificationModel
      .deleteOne({ _id: id.getValue() })
      .exec();

    if (result.deletedCount === 0) {
      throw new Error('Notification not found');
    }
  }
}
