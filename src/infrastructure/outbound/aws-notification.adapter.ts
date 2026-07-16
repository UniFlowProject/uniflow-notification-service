import { Injectable, Logger } from '@nestjs/common';
import { NotificationSenderPort } from '../../application/ports/notification-sender.port';
import { Notification } from '../../domain/entities/notification';
import type { NotificationRecipient } from '../../application/dto/notification-recipient';
import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { EmailTemplates } from './templates/email-templates';

@Injectable()
export class AWSNotificationAdapter implements NotificationSenderPort {
    private readonly logger = new Logger(AWSNotificationAdapter.name);
    private sesClient?: SESClient;
    private readonly senderAddress: string;
    private readonly frontendUrl: string;
    private readonly emailEnabled: boolean;

    constructor(private readonly configService: ConfigService) {
        this.senderAddress = this.configService.get<string>(
            'AWS_SES_SENDER_ADDRESS',
            'uniflow@fabian-vargas.com',
        );
        this.frontendUrl = this.configService.get<string>(
            'FRONTEND_URL',
            'https://uniflow.fabian-vargas.com',
        );
        this.emailEnabled = this.configService.get<string>('EMAIL_ENABLED', 'true') === 'true';

        this.initializeEmailService();
    }

    private initializeEmailService(): void {
        if (!this.emailEnabled) {
            this.logger.warn('📧 Email service is DISABLED');
            return;
        }

        const region = this.configService.get<string>('AWS_REGION', 'us-east-1');

        try {
            this.sesClient = new SESClient({ region });
            this.logger.log('✅ AWS Simple Email Service initialized');
        } catch (error) {
            this.logger.error('❌ Failed to initialize SES Client:', error);
        }
    }

    async sendPushNotification(
        _recipient: NotificationRecipient,
        _notification: Notification,
    ): Promise<boolean> {
        this.logger.warn('📱 [SKIPPED] Push notifications not yet implemented for AWS');
        return false;
    }

    async sendEmailNotification(
        recipient: NotificationRecipient,
        notification: Notification,
    ): Promise<boolean> {
        if (!this.emailEnabled || !this.sesClient) {
            this.logger.warn('📧 [SKIPPED] Email disabled');
            return false;
        }

        const emailContent = EmailTemplates.resolve(recipient, notification, this.frontendUrl);

        const params: SendEmailCommandInput = {
            Source: this.senderAddress,
            Destination: {
                ToAddresses: [recipient.email],
            },
            Message: {
                Body: {
                    Text: { Data: emailContent.text },
                    Html: { Data: emailContent.html, Charset: 'utf-8' },
                },
                Subject: { Data: emailContent.subject },
            },
        };

        const command = new SendEmailCommand(params);
        const result = await this.sesClient.send(command);

        if (result.$metadata.httpStatusCode === 200) {
            this.logger.log(
                `✅ Email sent to ${recipient.email} (ID: ${result.MessageId})`,
            );
            return true;
        }

        this.logger.error(`❌ Email failed with status: ${result.$metadata.httpStatusCode}`);
        return false;
    }
}
