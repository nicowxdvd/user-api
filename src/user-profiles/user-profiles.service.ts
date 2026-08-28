import { ConflictException,Inject,Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import { USER_PROFILE_REPOSITORY_TOKEN } from './interfaces/user-profile-repository.interface';
import type { IUserProfileRepository } from './interfaces/user-profile-repository.interface';

@Injectable()
export class UserProfilesService {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY_TOKEN)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async create( createUserProfileDto: CreateUserProfileDto,): Promise<UserProfile> {
    const { userId } = createUserProfileDto;

    const existingProfile = await this.userProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new ConflictException('El usuario ya tiene un perfil registrado.');
    }

    try {
      return await this.userProfileRepository.save({...createUserProfileDto, countryCode: this.normalizeCountryCode(createUserProfileDto.countryCode,),});
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
        throw new ConflictException(
          'El usuario ya tiene un perfil registrado.',
        );
      }
      throw new InternalServerErrorException('Error al crear el perfil');
    }
  }



  findAll(countryCode?: string): Promise<UserProfile[]> {
    return this.userProfileRepository.findAll(this.normalizeCountryCode(countryCode) ?? undefined);
  }



  async findOne(id: number): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findById(id);
    if (!userProfile) {
      throw new NotFoundException(`El perfil con ID ${id} no existe`);
    }
    return userProfile;
  }



  async findByUserId(userId: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundException(
        `El usuario con ID ${userId} no tiene un perfil registrado`,
      );
    }
    return userProfile;
  }

  async update(
    id: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    await this.findOne(id);

    try {
      const updated = await this.userProfileRepository.update(id, {
        ...updateUserProfileDto,
        countryCode: this.normalizeCountryCode(
          updateUserProfileDto.countryCode,
        ),
      });
      if (!updated) {
        throw new NotFoundException(`El perfil con ID ${id} no existe`);
      }
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
        throw new ConflictException(
          'Los datos enviados ya están en uso por otro perfil',
        );
      }
      throw new InternalServerErrorException('Error al actualizar el perfil');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.userProfileRepository.delete(id);
      if (!result || result.affected === 0) {
        throw new NotFoundException(`El perfil con ID ${id} no existe`);
      }
      return { message: `Perfil con ID ${id} eliminado exitosamente` };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.errno === 1451 || error?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'No se puede eliminar el perfil porque tiene registros asociados',
        );
      }
      throw new InternalServerErrorException('Error al eliminar el perfil');
    }
  }

  // country_code es CHAR(2): se normaliza a mayúsculas antes de persistir y de
  // filtrar, igual que RolesService normaliza el nombre del rol.
  private normalizeCountryCode(
    countryCode?: string | null,
  ): string | null | undefined {
    if (countryCode === undefined || countryCode === null) {
      return countryCode;
    }
    return countryCode.trim().toUpperCase();
  }
}
