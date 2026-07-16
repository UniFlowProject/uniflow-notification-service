export interface MarkNotificationAsReadCommand {
  notificationId: string;
}

export interface MarkNotificationAsReadResult {
  id: string;
  isRead: boolean;
  markedAt: Date;
  success: boolean;
}
