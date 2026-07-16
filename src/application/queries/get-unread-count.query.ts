export interface GetUnreadCountQuery {
  userId: string;
}

export interface GetUnreadCountResult {
  userId: string;
  unreadCount: number;
  lastChecked: Date;
}
