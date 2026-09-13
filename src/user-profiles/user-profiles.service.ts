import { ConflictException,Inject,Injectable, NotFoundException, } from '@nestjs/common';
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
    const { userId }      = createUserProfileDto;
    const existingProfile = await this.userProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new ConflictException('El usuario ya tiene un perfil registrado.');
    }

    return await this.userProfileRepository.save({...createUserProfileDto, countryCode: this.normalizeCountryCode(createUserProfileDto.countryCode,),});
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
      throw new NotFoundException( `El usuario con ID ${userId} no tiene un perfil registrado`,);
    }
    return userProfile;
  }



  async update(id: number, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const datosActualizados = {...updateUserProfileDto, countryCode: this.normalizeCountryCode(updateUserProfileDto.countryCode),};
    const updated = await this.userProfileRepository.update(id, datosActualizados);

    if (!updated) {
      throw new NotFoundException(`El perfil con ID ${id} no existe`);
    }

    return updated;
  }



  async remove(id: number): Promise<{ message: string }> {
    const result = await this.userProfileRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`El perfil con ID ${id} no existe`);
    }

    return { message: `Perfil con ID ${id} eliminado exitosamente` };
  }



  private normalizeCountryCode(countryCode?: string | null,): string | null | undefined {
    if (countryCode === undefined || countryCode === null) {
      return countryCode;
    }
    return countryCode.trim().toUpperCase();
  }
}
