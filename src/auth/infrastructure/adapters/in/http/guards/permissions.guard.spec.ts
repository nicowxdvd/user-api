import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import type { PermissionRepositoryPort } from '../../../../../../permissions/domain/ports/out/permission-repository.port';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;

  const contextConPermisos = (permissions: string[] = []): ExecutionContext => {
    const request = { user: { permissions } };
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    permissionRepository = {
      save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(),
      updateStatus: jest.fn(), isAssignedToAnyRole: jest.fn(), delete: jest.fn(),
    };

    guard = new PermissionsGuard(reflector as never, permissionRepository);

  });

  it('deja pasar cuando el endpoint no requiere permisos', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(contextConPermisos())).resolves.toBe(true);

  });

  it('deja pasar cuando el usuario ya tiene el permiso requerido', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles:manage']);

    await expect(guard.canActivate(contextConPermisos(['roles:manage']))).resolves.toBe(true);

  });

  it('deja pasar en modo fail-open cuando el permiso faltante no está asignado a ningún rol', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles:manage']);
    permissionRepository.isAssignedToAnyRole.mockResolvedValue(false);

    await expect(guard.canActivate(contextConPermisos([]))).resolves.toBe(true);

  });

  it('rechaza cuando el permiso faltante ya está asignado a algún rol', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles:manage']);
    permissionRepository.isAssignedToAnyRole.mockResolvedValue(true);

    await expect(guard.canActivate(contextConPermisos([]))).rejects.toThrow(ForbiddenException);

  });

});
