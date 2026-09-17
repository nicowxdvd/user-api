import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../../../../users/infrastructure/adapters/out/persistence/user.orm-entity';
import type { AuthRepositoryPort, AuthUserSnapshot } from '../../../../domain/ports/out/auth-repository.port';

@Injectable()
export class AuthTypeormRepository implements AuthRepositoryPort {

  constructor(@InjectRepository(UserOrmEntity) private readonly typeormRepo: Repository<UserOrmEntity>) {}


  async findByEmailWithPassword(email: string): Promise<AuthUserSnapshot | null> {
    const user = await this.typeormRepo.findOne({
      where: { email },
      relations: { role: { permissions: true } },
      select: {
        id: true, email: true, password: true, isActive: true, roleId: true,
        role: { id: true, name: true, isActive: true, permissions: { id: true, name: true, isActive: true } },
      },
    });

    if (!user?.password || !user.id || !user.email)
      return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      isActive: user.isActive ?? false,
      roleId: user.roleId,
      roleName: user.role?.name,
      rolePermissions: user.role?.permissions?.map((permission) => ({ name: permission.name, isActive: permission.isActive })) ?? [],
    };

  }


  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.typeormRepo.update(userId, { password: hashedPassword });

  }


  async findByEmail(email: string): Promise<{ id: string; isActive: boolean } | null> {
    const user = await this.typeormRepo.findOne({ where: { email }, select: { id: true, isActive: true } });
    if (!user?.id)
      return null;

    return { id: user.id, isActive: user.isActive ?? false };

  }

}
