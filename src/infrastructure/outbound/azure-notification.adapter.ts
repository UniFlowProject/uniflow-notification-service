import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationHubsClient } from '@azure/notification-hubs';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { NotificationSenderPort } from '../../application/ports/notification-sender.port';
import { Notification } from '../../domain/entities/notification';
import type { NotificationRecipient } from '../../application/dto/notification-recipient';
import { EmailTemplates } from './templates/email-templates';

@Injectable()
export class AzureNotificationAdapter implements NotificationSenderPort {
  private readonly logger = new Logger(AzureNotificationAdapter.name);
  private notificationHubClient?: NotificationHubsClient;
  private emailClient?: EmailClient;
  private readonly senderAddress: string;
  private readonly frontendUrl: string;
  private readonly pushEnabled: boolean;
  private readonly emailEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.senderAddress = this.configService.get<string>(
      'AZURE_COMMUNICATION_SENDER_ADDRESS',
      'DoNotReply@059ab36d-eeed-40a9-a8ee-c5779bb03e64.azurecomm.net',
    );

    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://uniflow.fabian-vargas.com',
    );

    this.pushEnabled =
      this.configService.get<string>('PUSH_ENABLED', 'true') === 'true';
    this.emailEnabled =
      this.configService.get<string>('EMAIL_ENABLED', 'true') === 'true';

    this.initializePushService();
    this.initializeEmailService();
  }

  private initializePushService(): void {
    if (!this.pushEnabled) {
      this.logger.warn('📱 Push notification service is DISABLED');
      return;
    }

    const connectionString = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_CONNECTION_STRING',
    );
    const hubName = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_NAME',
    );

    if (!connectionString || !hubName) {
      this.logger.error('❌ Azure Notification Hub configuration missing');
      return;
    }

    try {
      this.notificationHubClient = new NotificationHubsClient(
        connectionString,
        hubName,
      );
      this.logger.log('✅ Azure Notification Hub Service initialized');
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize Notification Hub Client:',
        error,
      );
    }
  }

  private initializeEmailService(): void {
    if (!this.emailEnabled) {
      this.logger.warn('📧 Email service is DISABLED');
      return;
    }

    const connectionString = this.configService.get<string>(
      'AZURE_COMMUNICATION_CONNECTION_STRING',
    );

    if (!connectionString) {
      this.logger.error(
        '❌ Azure Communication connection string not configured',
      );
      return;
    }

    try {
      this.emailClient = new EmailClient(connectionString);
      this.logger.log('✅ Azure Communication Email Service initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Email Client:', error);
    }
  }

  async sendPushNotification(
    recipient: NotificationRecipient,
    notification: Notification,
  ): Promise<boolean> {
    if (!this.pushEnabled || !this.notificationHubClient) {
      this.logger.warn('📱 [SKIPPED] Push notifications disabled');
      return false;
    }

    if (!recipient.deviceTokens.length) {
      this.logger.warn(
        `📱 No device tokens for recipient: ${recipient.email}`,
      );
      return false;
    }

    try {
      const message = {
        title: notification.getTitle(),
        body: notification.getMessage(),
        data: {
          notificationId: notification.getId().getValue(),
          type: notification.getType().getValue(),
          actionUrl: notification.getActionUrl(),
        },
      };

      for (const deviceToken of recipient.deviceTokens) {
        try {
          await this.notificationHubClient.sendNotification(
            {
              body: JSON.stringify(message),
              platform: 'gcm',
              contentType: 'application/json;charset=utf-8',
            },
            { tagExpression: `userId:${recipient.email}` },
          );

          this.logger.log(
            `📱 Push notification sent to device: ${deviceToken.substring(0, 10)}...`,
          );
        } catch (error) {
          this.logger.error(
            `📱 Failed to send push to device ${deviceToken.substring(0, 10)}...`,
            error,
          );
        }
      }

      return true;
    } catch (error) {
      this.logger.error('📱 Error sending push notification:', error);
      return false;
    }
  }

  async sendEmailNotification(
    recipient: NotificationRecipient,
    notification: Notification,
  ): Promise<boolean> {
    if (!this.emailEnabled || !this.emailClient) {
      this.logger.warn('📧 [SKIPPED] Email disabled');
      return false;
    }

    try {
      const emailContent = EmailTemplates.resolve(recipient, notification, this.frontendUrl);

      const message: EmailMessage = {
        senderAddress: this.senderAddress,
        content: {
          subject: emailContent.subject,
          plainText: emailContent.text,
          html: emailContent.html,
        },
        recipients: {
          to: [{ address: recipient.email }],
        },
      };

      this.logger.log(
        `📤 Sending email to ${recipient.email}: "${emailContent.subject}"`,
      );

      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

      if (result.status === 'Succeeded') {
        this.logger.log(
          `✅ Email sent successfully to ${recipient.email} (ID: ${result.id})`,
        );
        return true;
      } else {
        this.logger.error(`❌ Email failed with status: ${result.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `❌ Error sending email for notification ${notification.getId().getValue()}:`,
        error,
      );
      return false;
    }
  }

}
