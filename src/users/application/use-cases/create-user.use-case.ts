import { Inject, Injectable } from '@nestjs/common';
import { PASSWORD_HASHER_PORT } from '../../../shared/domain/ports/password-hasher.port';
import type { PasswordHasherPort } from '../../../shared/domain/ports/password-hasher.port';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';
import { EmailYaRegistradoError } from '../../domain/errors/user.errors';
import type { CreateUserCommand, CreateUserPort } from '../../domain/ports/in/create-user.port';
import { USER_REPOSITORY_PORT } from '../../domain/ports/out/user-repository.port';
import type { UserRepositoryPort } from '../../domain/ports/out/user-repository.port';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {

  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT) private readonly passwordHasher: PasswordHasherPort,
  ) {}


  async execute(command: CreateUserCommand): Promise<User> {
    const email        = Email.create(command.email);
    const existingUser = await this.userRepository.findByEmail(email.toString());

    if (existingUser)
      throw new EmailYaRegistradoError();

    const hash           = await this.passwordHasher.hash(command.password);
    const hashedPassword = HashedPassword.fromHash(hash);
    const user           = new User(email.toString(), hashedPassword.toString(), command.firstName, command.lastName, undefined);

    return this.userRepository.save(user);

  }
}
