import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const user = process.env.MONGODB_USERNAME;
        const pass = process.env.MONGODB_PASSWORD;
        const credentials = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
        const uri =
          process.env.MONGODB_URI ||
          `mongodb://${credentials}${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || '27017'}/${process.env.MONGODB_DATABASE || 'uniflow_notifications'}`;

        return {
          uri,
          retryWrites: true,
          w: 'majority',
          authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
        };
      },
    }),
    NotificationModule,
  ],
})
export class AppModule {}
