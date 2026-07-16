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
