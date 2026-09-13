/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_REPOSITORY_TOKEN, type IUserRepository } from './interface/user-repository.interface';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(), save: jest.fn(), update: jest.fn(),
      updateStatus: jest.fn(), delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: USER_REPOSITORY_TOKEN, useValue: repository }],
    }).compile();

    service = module.get<UsersService>(UsersService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();

  });

  it('rechaza un correo ya registrado', async () => {
    repository.findByEmail.mockResolvedValue({ id: '1' } as User);

    await expect(service.create({
      firstName: 'Ana', lastName: 'Gomez', email: 'ana@test.com', password: 'Abcdefg1',
    })).rejects.toThrow(ConflictException);

    expect(repository.save).not.toHaveBeenCalled();

  });

  it('lanza NotFound al buscar un usuario inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('99')).rejects.toThrow(NotFoundException);

  });

  it('lanza NotFound al eliminar un usuario inexistente', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: [] });

    await expect(service.remove('99')).rejects.toThrow(NotFoundException);

  });

  it('activa un usuario inactivo', async () => {
    repository.findById.mockResolvedValue({ id: '1', isActive: false } as User);

    const result = await service.toggleStatus('1');

    expect(repository.updateStatus).toHaveBeenCalledWith('1', true);
    expect(result.isActive).toBe(true);

  });

  it('desactiva un usuario activo', async () => {
    repository.findById.mockResolvedValue({ id: '1', isActive: true } as User);

    const result = await service.toggleStatus('1');

    expect(repository.updateStatus).toHaveBeenCalledWith('1', false);
    expect(result.isActive).toBe(false);

  });
});
