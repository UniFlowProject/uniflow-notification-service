import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpStatus,
  Headers,
  HttpCode
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import type { CreateNotificationCommand } from '../../application/commands/create-notification.command';
import { GetUserNotificationsUseCase } from '../../application/use-cases/get-user-notifications.use-case';
import type { GetUserNotificationsQuery } from '../../application/queries/get-user-notifications.query';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import type { MarkNotificationAsReadCommand } from '../../application/commands/mark-as-read.command';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import type { GetUnreadCountQuery } from '../../application/queries/get-unread-count.query';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.use-case';
import type { DeleteNotificationCommand } from '../../application/commands/delete-notification.command';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationListResponseDto } from './dto/notification-list-response.dto';
import { UnreadCountResponseDto } from './dto/unread-count-response.dto';
import { MarkReadResponseDto } from './dto/mark-read-response.dto';

@ApiTags('Notifications')
@Controller()
export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) { }

  @Post('notifications')
  @ApiOperation({
    summary: 'Create a new notification',
    description:
      'Creates a new notification for a user. The notification can be sent immediately or scheduled for later. Once created, it will be automatically sent via email, push notification, and WebSocket to connected clients.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  async create(
    @Body(ValidationPipe) dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const command: CreateNotificationCommand = {
      userId: dto.userId,
      name: dto.name,
      email: dto.email,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      priority: dto.priority,
      taskId: dto.taskId,
      subjectId: dto.subjectId,
      actionUrl: dto.actionUrl,
      scheduledFor: dto.scheduledFor,
    };

    const notification = await this.createNotificationUseCase.execute(command);

    return NotificationResponseDto.fromDomain(notification);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get notifications for a user',
    description:
      'Retrieves a paginated list of notifications for a specific user. Supports filtering by read status and pagination.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user',
    example: 'user-123',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of notifications to return',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of notifications to skip (for pagination)',
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    description: 'Filter by read status (true/false)',
    example: false,
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notifications retrieved successfully',
    type: NotificationListResponseDto,
  })
  async findByUser(
    @Param('userId') userId: string,
    @Headers() headers: Record<string, string>,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('isRead') isRead?: boolean,
  ): Promise<NotificationListResponseDto> {

    const userIdFromHeader = headers["x-user-id"];
    const userNameFromHeader = headers["x-user-name"];
    const userEmailFromHeader = headers["x-user-email"];
    const userPictureFromHeader = headers["x-user-picture"];

    console.log("User Headers", userIdFromHeader, userNameFromHeader, userEmailFromHeader, userPictureFromHeader);

    const query: GetUserNotificationsQuery = {
      userId,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
      isRead:
        isRead !== undefined
          ? typeof isRead === 'boolean'
            ? isRead
            : isRead === 'true'
          : undefined,
    };

    const result = await this.getUserNotificationsUseCase.execute(query);

    return {
      notifications: result.notifications.map((n) =>
        NotificationResponseDto.fromDomain(n),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Retrieves the count of unread notifications for a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user',
    example: 'user-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unread count retrieved successfully',
    type: UnreadCountResponseDto,
  })
  async getUnreadCount(
    @Param('userId') userId: string,
  ): Promise<UnreadCountResponseDto> {
    const query: GetUnreadCountQuery = { userId };
    return this.getUnreadCountUseCase.execute(query);
  }

  @Put('notifications/:id/mark-read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a specific notification as read. Sets the isRead flag to true and records the readAt timestamp.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read successfully',
    type: MarkReadResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Notification not found',
  })
  async markAsRead(@Param('id') id: string): Promise<MarkReadResponseDto> {
    const command: MarkNotificationAsReadCommand = { notificationId: id };
    return this.markNotificationAsReadUseCase.execute(command);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('notifications/:id')
  @ApiOperation({
    summary: 'Delete notification',
    description:
      'Permanently deletes a notification. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the notification to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notification deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Notification not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    const command: DeleteNotificationCommand = { notificationId: id };
    await this.deleteNotificationUseCase.execute(command);
  }
}
