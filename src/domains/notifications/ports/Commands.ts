import type {
  NotificationCreateResult,
  NotificationDeleteResult,
  NotificationType,
  NotificationUpdateResult,
} from './Models';
import type { CommandResult } from '@SharedKernel/Types';

export type CreateNotificationParams = {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  actorId?: number;            // quem fez a ação
  entityId?: number;           // qual objeto gerou a notificação
  entityType?: string;         // tipo do objeto (POEM, COMMENT, USER...)
  data?: Record<string, unknown>; // dados extras
  aggregatedCount?: number;      // contador inicial (padrão 1)
  aggregateWindowMinutes?: number; // para lógica de agregação
};

export type MarkNotificationAsReadParams = {
  notificationId: number;
  userId: number;
};

export type DeleteNotificationParams = {
  notificationId: number;
  userId: number;
};

export interface NotificationsCommandsServices {
  markAsRead: (
    params: MarkNotificationAsReadParams,
  ) => Promise<NotificationUpdateResult>;
  
  deleteNotification: (
    params: DeleteNotificationParams,
  ) => Promise<NotificationDeleteResult>;
  
  createNotification: (
    params: CreateNotificationParams,
  ) => Promise<NotificationCreateResult>;
}

export interface CommandsRepository {
  insertNotification(
    notification: CreateNotificationParams,
  ): Promise<CommandResult<NotificationCreateResult>>;

  markNotificationAsRead(
    notificationId: number,
    userId: number,
  ): Promise<CommandResult<NotificationUpdateResult>>;

  deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<CommandResult<NotificationDeleteResult>>;
}
