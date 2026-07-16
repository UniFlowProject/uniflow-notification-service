export interface GetUserNotificationsQuery {
  userId: string;
  limit?: number;
  offset?: number;
  isRead?: boolean;
}
