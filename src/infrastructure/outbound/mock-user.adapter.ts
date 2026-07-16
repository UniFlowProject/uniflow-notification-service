import { Injectable } from '@nestjs/common';
import { UserServicePort } from '../../application/ports/user-service.port';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';

@Injectable()
export class MockUserAdapter implements UserServicePort {
  private users = new Map<string, User>();

  constructor() {
    this.seedUsers();
  }

  private seedUsers(): void {
    const user1 = User.create({
      id: new UserId('test-user-1'),
      email: new Email('user1@example.com'),
      name: 'Test User 1',
      deviceTokens: ['device-token-1', 'device-token-2'],
    });

    const user2 = User.create({
      id: new UserId('test-user-2'),
      email: new Email('user2@example.com'),
      name: 'Test User 2',
      deviceTokens: ['device-token-3'],
    });

    this.users.set(user1.getId().getValue(), user1);
    this.users.set(user2.getId().getValue(), user2);
  }

  getUserById(userId: UserId): Promise<User> {
    const user = this.users.get(userId.getValue());
    if (!user) {
      throw new Error(`User not found: ${userId.getValue()}`);
    }
    return Promise.resolve(user);
  }

  addUser(user: User): void {
    this.users.set(user.getId().getValue(), user);
  }
}
